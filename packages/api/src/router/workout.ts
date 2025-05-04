import type { TRPCRouterRecord } from "@trpc/server";
import { GoogleGenAI, Type } from "@google/genai";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@omc/db/client";
import {
  workoutCategories as _workoutCategories,
  exercises as exercisesTable,
  fitnessGoals,
  user,
  userWorkoutProgress,
  workoutExercises,
  workoutPlanDays,
  workoutPlans,
  workouts,
} from "@omc/db/schema";

import { adminProcedure, protectedProcedure, publicProcedure } from "../trpc";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const exerciseSchema = z.object({
  name: z.string(),
  targetMuscles: z.string(),
  sets: z.number(),
  reps: z.number(),
  restSeconds: z.number(),
});

const workoutSchema = z.object({
  title: z.string(),
  description: z.string(),
  durationMinutes: z.number(),
  difficultyLevel: z.string(),
  caloriesBurn: z.number(),
  exercises: z.array(exerciseSchema),
});

const _weeklyPlanSchema = z.object({
  workouts: z.array(
    z.object({
      dayNumber: z.number(),
      workout: workoutSchema,
    }),
  ),
  targetCaloriesBurn: z.number(),
});

type WeeklyPlan = z.infer<typeof _weeklyPlanSchema>;
type Workout = z.infer<typeof workoutSchema>;

// Helper function to create a new workout with exercises
async function createNewWorkout(workout: Workout) {
  const [insertedWorkout] = await db
    .insert(workouts)
    .values({
      title: workout.title,
      description: workout.description,
      durationMinutes: workout.durationMinutes,
      difficultyLevel: workout.difficultyLevel,
      caloriesBurn: workout.caloriesBurn,
    })
    .returning();

  if (!insertedWorkout) {
    throw new Error("Failed to insert workout");
  }

  // Insert exercises
  await Promise.all(
    workout.exercises.map(async (exercise, index) => {
      const [insertedExercise] = await db
        .insert(exercisesTable)
        .values({
          name: exercise.name,
          targetMuscles: exercise.targetMuscles,
        })
        .returning();

      if (!insertedExercise) {
        throw new Error(`Failed to insert exercise ${exercise.name}`);
      }

      await db.insert(workoutExercises).values({
        workoutId: insertedWorkout.id,
        exerciseId: insertedExercise.id,
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.restSeconds,
        orderIndex: index + 1,
      });
    }),
  );

  return insertedWorkout;
}

// Helper function to check workout similarity using Gemini
async function findSimilarWorkout(
  workout: Workout,
  existingWorkouts: (typeof workouts.$inferSelect)[],
): Promise<number | null> {
  const similarityResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Compare this workout:
Title: "${workout.title}"
Description: "${workout.description}"
Duration: ${workout.durationMinutes} minutes
Difficulty: ${workout.difficultyLevel}
Exercises: ${workout.exercises.map((e) => e.name).join(", ")}

With these existing workouts:
${existingWorkouts
  .map(
    (w) => `
ID: ${w.id}
Title: "${w.title}"
Description: "${w.description}"
Duration: ${w.durationMinutes} minutes
Difficulty: ${w.difficultyLevel}`,
  )
  .join("\n")}

If the workout is very similar to any existing workout (similar exercises, duration, and difficulty), return the ID of that workout. If not similar, return null.
Respond with just the ID number or null, nothing else.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.NUMBER,
            nullable: true,
          },
        },
      },
    },
  });

  try {
    const responseData = JSON.parse(similarityResponse.text ?? "{}") as {
      id?: number | null;
    };
    return responseData.id ?? null;
  } catch (error) {
    console.error("Failed to parse similarity response:", error);
    return null;
  }
}

export const workoutRouter = {
  getWorkouts: publicProcedure.query(async () => {
    const workouts = await db.query.workouts.findMany();
    return workouts;
  }),

  getWorkoutCategories: publicProcedure.query(async () => {
    const categories = await db.query.workoutCategories.findMany();
    return categories;
  }),

  getExercises: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
        searchTerm: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const { limit, offset, searchTerm } = input;

        let exerciseQuery;

        if (searchTerm) {
          const searchPattern = `%${searchTerm.toLowerCase()}%`;
          exerciseQuery = await db.query.exercises.findMany({
            limit,
            offset,
            where: (exercises) =>
              sql`LOWER(${exercises.name}) LIKE ${searchPattern} OR LOWER(${exercises.targetMuscles}) LIKE ${searchPattern}`,
          });
        } else {
          exerciseQuery = await db.query.exercises.findMany({
            limit,
            offset,
          });
        }

        const countResult = await db
          .select({ count: sql`COUNT(*)` })
          .from(exercisesTable);
        const totalCount = Number(countResult[0]?.count ?? 0);

        return {
          exercises: exerciseQuery,
          pagination: {
            total: totalCount,
            offset,
            limit,
            hasMore: offset + exerciseQuery.length < totalCount,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch exercises",
          cause: error,
        });
      }
    }),

  getWorkoutWithExercises: publicProcedure
    .input(
      z.object({
        workoutId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { workoutId } = input;

      const workout = await db.query.workouts.findFirst({
        where: eq(workouts.id, workoutId),
      });

      if (!workout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Workout with ID ${workoutId} not found`,
        });
      }

      const workoutExercisesData = await db.query.workoutExercises.findMany({
        where: eq(workoutExercises.workoutId, workoutId),
        orderBy: [desc(workoutExercises.orderIndex)],
      });

      const exercisesWithDetails = await Promise.all(
        workoutExercisesData.map(async (workoutExercise) => {
          const exercise = await db.query.exercises.findFirst({
            where: eq(exercisesTable.id, workoutExercise.exerciseId),
          });

          return {
            ...workoutExercise,
            name: exercise?.name ?? "Unknown Exercise",
            description: exercise?.description,
            targetMuscles: exercise?.targetMuscles,
            imageUrl: exercise?.imageUrl,
            videoUrl: exercise?.videoUrl,
          };
        }),
      );

      return {
        ...workout,
        exercises: exercisesWithDetails,
      };
    }),
  insertWorkout: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().optional(),
        durationMinutes: z.number().min(1),
        difficultyLevel: z
          .string()
          .refine(
            (val) =>
              ["beginner", "intermediate", "advanced"].includes(
                val.toLowerCase(),
              ),
            "Difficulty level must be beginner, intermediate, or advanced",
          ),
        caloriesBurn: z.number().min(0).optional(),
        rating: z
          .number()
          .min(0)
          .max(5)
          .optional()
          .transform((val) => val?.toString()),
        imageUrl: z.string().url().optional(),
        categoryId: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const [insertedWorkout] = await db
          .insert(workouts)
          .values({
            title: input.title,
            description: input.description,
            durationMinutes: input.durationMinutes,
            difficultyLevel: input.difficultyLevel,
            caloriesBurn: input.caloriesBurn,
            rating: input.rating,
            imageUrl: input.imageUrl,
            categoryId: input.categoryId,
          })
          .returning();

        return insertedWorkout;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to insert workout",
          cause: error,
        });
      }
    }),

  insertWorkoutExercise: adminProcedure
    .input(
      z.object({
        workoutId: z.number(),
        exerciseId: z.number(),
        sets: z.number().min(1),
        reps: z.number().min(1),
        restSeconds: z.number().min(0),
        orderIndex: z.number().min(1).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const workout = await db.query.workouts.findFirst({
          where: eq(workouts.id, input.workoutId),
        });

        if (!workout) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Workout with ID ${input.workoutId} not found`,
          });
        }

        const exercise = await db.query.exercises.findFirst({
          where: eq(exercisesTable.id, input.exerciseId),
        });

        if (!exercise) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Exercise with ID ${input.exerciseId} not found`,
          });
        }

        let orderIndex = input.orderIndex;
        if (!orderIndex) {
          const maxOrderIndex = await db.query.workoutExercises.findFirst({
            where: eq(workoutExercises.workoutId, input.workoutId),
            orderBy: [desc(workoutExercises.orderIndex)],
          });
          orderIndex = maxOrderIndex ? maxOrderIndex.orderIndex + 1 : 1;
        }

        const [insertedWorkoutExercise] = await db
          .insert(workoutExercises)
          .values({
            workoutId: input.workoutId,
            exerciseId: input.exerciseId,
            sets: input.sets,
            reps: input.reps,
            restSeconds: input.restSeconds,
            orderIndex: orderIndex,
          })
          .returning();

        return insertedWorkoutExercise;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to insert workout exercise",
          cause: error,
        });
      }
    }),

  insertBulkWorkoutExercises: adminProcedure
    .input(
      z.object({
        workoutId: z.number(),
        exercises: z.array(
          z.object({
            exerciseId: z.number(),
            sets: z.number().min(1),
            reps: z.number().min(1),
            restSeconds: z.number().min(0),
            orderIndex: z.number().min(1).optional(),
          }),
        ),
        replaceExisting: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const workout = await db.query.workouts.findFirst({
          where: eq(workouts.id, input.workoutId),
        });

        if (!workout) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Workout with ID ${input.workoutId} not found`,
          });
        }

        if (input.replaceExisting) {
          await db
            .delete(workoutExercises)
            .where(eq(workoutExercises.workoutId, input.workoutId));
        }

        let maxOrderIndex = 0;
        if (input.exercises.some((e) => !e.orderIndex)) {
          const highestOrderExercise =
            await db.query.workoutExercises.findFirst({
              where: eq(workoutExercises.workoutId, input.workoutId),
              orderBy: [desc(workoutExercises.orderIndex)],
            });
          maxOrderIndex = highestOrderExercise?.orderIndex ?? 0;
        }

        const insertedExercises = await Promise.all(
          input.exercises.map(async (exerciseInput, index) => {
            const exercise = await db.query.exercises.findFirst({
              where: eq(exercisesTable.id, exerciseInput.exerciseId),
            });

            if (!exercise) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Exercise with ID ${exerciseInput.exerciseId} not found`,
              });
            }

            const orderIndex =
              exerciseInput.orderIndex ?? maxOrderIndex + index + 1;

            const [insertedWorkoutExercise] = await db
              .insert(workoutExercises)
              .values({
                workoutId: input.workoutId,
                exerciseId: exerciseInput.exerciseId,
                sets: exerciseInput.sets,
                reps: exerciseInput.reps,
                restSeconds: exerciseInput.restSeconds,
                orderIndex: orderIndex,
              })
              .returning();

            return insertedWorkoutExercise;
          }),
        );

        return {
          workoutId: input.workoutId,
          insertedCount: insertedExercises.length,
          exercises: insertedExercises,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to insert workout exercises",
          cause: error,
        });
      }
    }),

  trackWorkoutProgress: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        workoutId: z.number(),
        durationMinutes: z.number().min(1),
        caloriesBurned: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { userId, workoutId, durationMinutes, caloriesBurned } = input;

        // Check if workout exists
        const workout = await db.query.workouts.findFirst({
          where: eq(workouts.id, workoutId),
        });

        if (!workout) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Workout with ID ${workoutId} not found`,
          });
        }

        // Record the workout progress
        const [progressRecord] = await db
          .insert(userWorkoutProgress)
          .values({
            userId,
            workoutId,
            completedAt: new Date().toISOString(),
            durationMinutes,
            caloriesBurned,
          })
          .returning();

        return progressRecord;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to track workout progress",
          cause: error,
        });
      }
    }),

  getUserWorkoutStats: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        period: z.enum(["week", "month", "all"]).optional().default("all"),
      }),
    )
    .query(async ({ input }) => {
      try {
        const { userId, period } = input;

        // Build date filter based on period
        let dateFilter = undefined;
        const now = new Date();

        if (period === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          dateFilter = sql`${userWorkoutProgress.completedAt} >= ${weekAgo.toISOString()}`;
        } else if (period === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          dateFilter = sql`${userWorkoutProgress.completedAt} >= ${monthAgo.toISOString()}`;
        }

        // Get user workout progress records
        const workoutRecords = await db.query.userWorkoutProgress.findMany({
          where: (fields) => {
            const userFilter = eq(fields.userId, userId);
            return period === "all"
              ? userFilter
              : sql`${userFilter} AND ${dateFilter}`;
          },
          orderBy: [desc(userWorkoutProgress.completedAt)],
        });

        // Calculate basic stats
        const totalWorkouts = workoutRecords.length;
        const totalDuration = workoutRecords.reduce(
          (sum, record) => sum + (record.durationMinutes ?? 0),
          0,
        );
        const totalCalories = workoutRecords.reduce(
          (sum, record) => sum + (record.caloriesBurned ?? 0),
          0,
        );

        // Simple streak calculation - count consecutive days with workouts
        let currentStreak = 0;

        if (workoutRecords.length > 0) {
          // Start with 1 for the current day if there's at least one workout
          currentStreak = 1;

          // Check for consecutive daily workouts (simplified logic)
          // This is a placeholder implementation - for a real app, you'd need more robust logic
        }

        return {
          totalWorkouts,
          totalDuration,
          totalCalories,
          currentStreak,
          recentWorkouts: workoutRecords.slice(0, 5), // Return 5 most recent workouts
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get user workout stats",
          cause: error,
        });
      }
    }),

  generateWeeklyPlan: protectedProcedure
    .output(
      z.object({
        id: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        targetCaloriesBurn: z.number(),
        workouts: z.array(
          z.object({
            dayNumber: z.number(),
            workout: z.object({
              id: z.number(),
              title: z.string(),
              description: z.string(),
              durationMinutes: z.number(),
              difficultyLevel: z.string(),
              caloriesBurn: z.number(),
              exercises: z.array(exerciseSchema),
            }),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx }) => {
      // Get user and their fitness goals
      const [dbUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, ctx.session.user.email))
        .execute();

      if (!dbUser) {
        throw new Error("User not found");
      }

      const [fitnessGoal] = await db
        .select()
        .from(fitnessGoals)
        .where(eq(fitnessGoals.userId, dbUser.id))
        .execute();

      // Generate weekly workout plan using Gemini
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `
          Generate a 7-day workout plan. For each day, provide a workout with:
          - Day number (1-7)
          - Workout details:
            - title
            - description
            - duration (minutes)
            - difficulty level (beginner/intermediate/advanced)
            - calories burn estimate
            - exercises (3-5 per workout)
              - name
              - target muscles
              - sets
              - reps
              - rest seconds between sets

          Consider these user preferences:
          ${
            fitnessGoal
              ? `
          - Desired shape: ${fitnessGoal.desiredShape}
          - Body tone preference: ${fitnessGoal.bodyTonePreference}/100
          - Style preference: ${fitnessGoal.stylePreference}/100
          `
              : "- No specific preferences set"
          }

          Make it a balanced plan with:
          - Progressive intensity
          - Different muscle groups
          - Rest days
          - Variety of exercises
          
          Return as JSON only.
        `,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              workouts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.NUMBER },
                    workout: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        durationMinutes: { type: Type.NUMBER },
                        difficultyLevel: { type: Type.STRING },
                        caloriesBurn: { type: Type.NUMBER },
                        exercises: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              targetMuscles: { type: Type.STRING },
                              sets: { type: Type.NUMBER },
                              reps: { type: Type.NUMBER },
                              restSeconds: { type: Type.NUMBER },
                            },
                            required: [
                              "name",
                              "targetMuscles",
                              "sets",
                              "reps",
                              "restSeconds",
                            ],
                          },
                        },
                      },
                      required: [
                        "title",
                        "description",
                        "durationMinutes",
                        "difficultyLevel",
                        "caloriesBurn",
                        "exercises",
                      ],
                    },
                  },
                  required: ["dayNumber", "workout"],
                },
              },
              targetCaloriesBurn: { type: Type.NUMBER },
            },
            required: ["workouts", "targetCaloriesBurn"],
          },
        },
      });

      if (!response.text) {
        throw new Error("No response from Gemini");
      }

      const weeklyPlan = JSON.parse(response.text) as WeeklyPlan;

      // Fetch existing workouts for similarity check
      const existingWorkouts = await db.select().from(workouts).execute();

      // Create workout plan
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6);

      const [workoutPlan] = await db
        .insert(workoutPlans)
        .values({
          userId: dbUser.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          targetCaloriesBurn: weeklyPlan.targetCaloriesBurn,
          status: "active",
        })
        .returning();

      if (!workoutPlan) {
        throw new Error("Failed to create workout plan");
      }

      // Create workouts and plan days
      const workoutsWithIds = await Promise.all(
        weeklyPlan.workouts.map(async ({ dayNumber, workout }) => {
          // Check for similar existing workout
          const similarWorkoutId = await findSimilarWorkout(
            workout,
            existingWorkouts,
          );

          // Get or create workout
          const insertedWorkout = similarWorkoutId
            ? (existingWorkouts.find((w) => w.id === similarWorkoutId) ??
              (await createNewWorkout(workout)))
            : await createNewWorkout(workout);

          // Create plan day entry
          await db.insert(workoutPlanDays).values({
            planId: workoutPlan.id,
            workoutId: insertedWorkout.id,
            dayNumber,
            completed: false,
          });

          return {
            dayNumber,
            workout: {
              ...workout,
              id: insertedWorkout.id,
            },
          };
        }),
      );

      return {
        id: workoutPlan.id,
        startDate: workoutPlan.startDate,
        endDate: workoutPlan.endDate,
        targetCaloriesBurn: weeklyPlan.targetCaloriesBurn,
        workouts: workoutsWithIds,
      };
    }),

  getCurrentWeekPlan: protectedProcedure.query(async ({ ctx }) => {
    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, ctx.session.user.email))
      .execute();

    if (!dbUser) {
      throw new Error("User not found");
    }

    // Get current active plan
    const [currentPlan] = await db
      .select()
      .from(workoutPlans)
      .where(
        and(
          eq(workoutPlans.userId, dbUser.id),
          eq(workoutPlans.status, "active"),
        ),
      )
      .execute();

    if (!currentPlan) {
      return null;
    }

    // Get plan days with workouts
    const planDays = await db
      .select({
        dayNumber: workoutPlanDays.dayNumber,
        completed: workoutPlanDays.completed,
        completedAt: workoutPlanDays.completedAt,
        workout: workouts,
      })
      .from(workoutPlanDays)
      .where(eq(workoutPlanDays.planId, currentPlan.id))
      .innerJoin(workouts, eq(workoutPlanDays.workoutId, workouts.id))
      .orderBy(workoutPlanDays.dayNumber)
      .execute();

    // Get exercises for each workout
    const workoutsWithExercises = await Promise.all(
      planDays.map(async (day) => {
        const exercises = await db.query.workoutExercises.findMany({
          where: eq(workoutExercises.workoutId, day.workout.id),
          orderBy: [desc(workoutExercises.orderIndex)],
        });

        const exercisesWithDetails = await Promise.all(
          exercises.map(async (workoutExercise) => {
            const exercise = await db.query.exercises.findFirst({
              where: eq(exercisesTable.id, workoutExercise.exerciseId),
            });

            return {
              ...workoutExercise,
              name: exercise?.name ?? "Unknown Exercise",
              description: exercise?.description,
              targetMuscles: exercise?.targetMuscles,
              imageUrl: exercise?.imageUrl,
              videoUrl: exercise?.videoUrl,
            };
          }),
        );

        return {
          dayNumber: day.dayNumber,
          completed: day.completed,
          completedAt: day.completedAt,
          workout: {
            ...day.workout,
            exercises: exercisesWithDetails,
          },
        };
      }),
    );

    return {
      id: currentPlan.id,
      startDate: currentPlan.startDate,
      endDate: currentPlan.endDate,
      targetCaloriesBurn: currentPlan.targetCaloriesBurn,
      status: currentPlan.status,
      workouts: workoutsWithExercises,
    };
  }),

  toggleWorkoutDayCompletion: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        dayNumber: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [dbUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, ctx.session.user.email))
        .execute();

      if (!dbUser) {
        throw new Error("User not found");
      }

      // Get plan day
      const [planDay] = await db
        .select()
        .from(workoutPlanDays)
        .where(
          and(
            eq(workoutPlanDays.planId, input.planId),
            eq(workoutPlanDays.dayNumber, input.dayNumber),
          ),
        )
        .execute();

      if (!planDay) {
        throw new Error("Plan day not found");
      }

      // Toggle completion status
      const [updatedPlanDay] = await db
        .update(workoutPlanDays)
        .set({
          completed: !planDay.completed,
          completedAt: !planDay.completed ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(workoutPlanDays.id, planDay.id))
        .returning();

      return updatedPlanDay;
    }),
} satisfies TRPCRouterRecord;
