import type { S3Client } from "@aws-sdk/client-s3";
import type { TRPCRouterRecord } from "@trpc/server";
import type { Exercise, WeeklyPlan, Workout } from "@omc/validators/workout";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { GoogleGenAI, Type } from "@google/genai";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { OpenAI } from "openai";
import { z } from "zod";

import { db } from "@omc/db/client";
import {
  workoutCategories as _workoutCategories,
  exercises as exercisesTable,
  fitnessGoals,
  milestoneLevels,
  user,
  userMilestoneProgress,
  userWorkoutProgress,
  workoutClasses,
  workoutExercises,
  workoutPlanDays,
  workoutPlans,
  workouts,
  workoutToClass,
} from "@omc/db/schema";
import { prettyPrint, slugify } from "@omc/validators";
import { exerciseSchema } from "@omc/validators/workout";

import { adminProcedure, protectedProcedure, publicProcedure } from "../trpc";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateAndUploadImage = async (
  s3: S3Client,
  workoutName: string,
): Promise<string> => {
  const img = await openai.images.generate({
    model: "gpt-image-1",
    prompt: `Thumbnail image for ${workoutName}. The image should be a high-quality, professional-looking thumbnail for a workout video with no text or watermarks. Prefer a female model.`,
    n: 1,
    size: "1024x1024",
  });

  if (!img.data?.[0] || img.data.length === 0) {
    throw new Error("No image data returned from OpenAI");
  }

  const imageBuffer = Buffer.from(img.data[0].b64_json ?? "", "base64");
  const fileKey = `workouts/${slugify(workoutName)}.png`;

  const putCommand = new PutObjectCommand({
    Bucket: "snatched-ai-bucket",
    Key: fileKey,
    Body: imageBuffer,
    ContentType: "image/png",
  });

  await s3.send(putCommand);

  return `https://snatched-ai-bucket.s3.amazonaws.com/${fileKey}`;
};

// Helper function to check exercise similarity using Gemini
async function checkExerciseSimilarity(
  exercise: Exercise,
  existingExercises: (typeof exercisesTable.$inferSelect)[],
) {
  const similarityResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Compare this exercise:
    Title: "${exercise.name}"
    Target Muscles: "${exercise.targetMuscles}"

    With these existing exercises:
    ${existingExercises.map((e) => `ID: ${e.id} Title: "${e.name}" Target Muscles: "${e.targetMuscles}"`).join("\n")}

    If the exercise is very similar, return the ID of the existing exercise. If not similar, return null.
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
Difficulty: ${workout.difficultyLevel}

With these existing workouts:
${existingWorkouts
  .map(
    (w) => `
ID: ${w.id}
Title: "${w.title}"
Description: "${w.description}"
Difficulty: ${w.difficultyLevel}`,
  )
  .join("\n")}

If the workout is very similar to any existing workout (similar title, description and difficulty), return the ID of that workout. If not similar, return null.
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

// Helper function to create a new workout with exercises
async function createNewWorkout(s3: S3Client, workout: Workout) {
  const imageUrl = await generateAndUploadImage(s3, workout.title);

  const [insertedWorkout] = await db
    .insert(workouts)
    .values({
      title: workout.title,
      description: workout.description,
      durationMinutes: workout.durationMinutes || 30,
      difficultyLevel: workout.difficultyLevel,
      caloriesBurn: workout.caloriesBurn,
      categoryId: workout.categoryId,
      imageUrl,
    })
    .returning();

  if (!insertedWorkout) {
    throw new Error("Failed to insert workout");
  }

  const existingExercises = await db.select().from(exercisesTable).execute();

  // Insert exercises
  await Promise.all(
    workout.exercises.map(async (exercise, index) => {
      // Check if a similar exercise already exists
      const similarExerciseId = await checkExerciseSimilarity(
        exercise,
        existingExercises,
      );
      if (similarExerciseId) {
        await db.insert(workoutExercises).values({
          workoutId: insertedWorkout.id,
          exerciseId: similarExerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          orderIndex: index + 1,
        });
      } else {
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
      }
    }),
  );

  return insertedWorkout;
}

export const workoutRouter = {
  getWorkouts: publicProcedure.query(async ({ ctx }) => {
    try {
      const workoutResults = await db
        .select({
          id: workouts.id,
          title: workouts.title,
          description: workouts.description,
          durationMinutes: workouts.durationMinutes,
          difficultyLevel: workouts.difficultyLevel,
          caloriesBurn: workouts.caloriesBurn,
          rating: workouts.rating,
          imageUrl: workouts.imageUrl,
          categoryId: workouts.categoryId,
          classes: sql<{ id: number; name: string; description: string | null }[]>`
            COALESCE(
              json_agg(
                json_build_object(
                  'id', ${workoutClasses.id},
                  'name', ${workoutClasses.name},
                  'description', ${workoutClasses.description}
                )
              ) FILTER (WHERE ${workoutClasses.id} IS NOT NULL),
              '[]'
            )
          `.as('classes'),
        })
        .from(workouts)
        .leftJoin(workoutToClass, eq(workouts.id, workoutToClass.workoutId))
        .leftJoin(
          workoutClasses,
          eq(workoutToClass.classId, workoutClasses.id),
        )
        .groupBy(workouts.id);

      // ctx.logger.debug(`workoutResults: ${workoutResults.length}`);
      console.log(`\n`);

      return workoutResults;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch workouts",
        cause: error,
      });
    }
  }),

  getWorkoutCategories: publicProcedure.query(async () => {
    const categories = await db.query.workoutCategories.findMany();
    return categories;
  }),

  getWorkoutClasses: publicProcedure.query(async ({ ctx }) => {
    try {
      const classes = await db.query.workoutClasses.findMany();

      // ctx.logger.info(`Found ${classes.length} workout classes`);
      return classes;
    } catch (error) {
      ctx.logger.error("Failed to fetch workout classes", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch workout classes",
        cause: error,
      });
    }
  }),

  getWorkoutWithExercises: protectedProcedure
    .input(
      z.object({
        workoutId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { workoutId } = input;
      let workoutPlanDay: typeof workoutPlanDays.$inferSelect | undefined;

      const workout = await db.query.workouts.findFirst({
        where: eq(workouts.id, workoutId),
      });

      // check if the user has an active workout plan
      const workoutPlan = await db.query.workoutPlans.findFirst({
        where: and(
          eq(workoutPlans.userId, Number(ctx.session.user.id)),
          eq(workoutPlans.status, "active"),
          gte(workoutPlans.endDate, new Date().toISOString()),
        ),
      });

      // check if the workout is in the workout plan days
      if (workoutPlan) {
        workoutPlanDay = await db.query.workoutPlanDays.findFirst({
          where: and(
            eq(workoutPlanDays.workoutId, workoutId),
            eq(workoutPlanDays.planId, workoutPlan.id),
          ),
        });
      }

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
        planId: workoutPlan?.id ?? 0,
        dayNumber: workoutPlanDay?.dayNumber ?? 0,
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

  trackWorkoutProgress: protectedProcedure
    .input(
      z.object({
        workoutId: z.number(),
        durationMinutes: z.number().min(1),
        caloriesBurned: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { workoutId, durationMinutes, caloriesBurned } = input;
        const userId = Number(ctx.session.user.id);
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

  getUserWorkoutStats: protectedProcedure
    .input(
      z.object({
        period: z.enum(["week", "month", "all"]).optional().default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { user } = ctx.session;

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
            const userFilter = eq(fields.userId, Number(user.id));
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
      // Get fitness goals
      const userId = Number(ctx.session.user.id);

      // check if the user has an active workout plan
      const [activeWorkoutPlan] = await db
        .select()
        .from(workoutPlans)
        .where(
          and(
            eq(workoutPlans.userId, userId),
            eq(workoutPlans.status, "active"),
            gte(workoutPlans.endDate, new Date().toISOString()),
          ),
        )
        .execute();

      if (activeWorkoutPlan) {
        throw new Error("User already has an active workout plan");
      }

      const [fitnessGoal] = await db
        .select()
        .from(fitnessGoals)
        .where(eq(fitnessGoals.userId, userId))
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
            - duration (minutes) - at least 5 minutes
            - difficulty level (beginner/intermediate/advanced)
            - calories burn estimate
            - categoryId (1 - Full Body, 2 - Lower Body, 3 - Upper Body, 4 - Core, 5 - HIIT, 6 - Cardio)
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
                        categoryId: {
                          type: Type.NUMBER,
                          minimum: 1,
                          maximum: 6,
                        },
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
                        "categoryId",
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
      prettyPrint(weeklyPlan);

      // Fetch existing workouts for similarity check
      const existingWorkouts = await db.select().from(workouts).execute();

      // Create workout plan
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6);

      const [workoutPlan] = await db
        .insert(workoutPlans)
        .values({
          userId,
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
      const workoutsWithIds = [];
      for (const { dayNumber, workout } of weeklyPlan.workouts) {
        // Check for similar existing workout
        const similarWorkoutId = await findSimilarWorkout(
          workout,
          existingWorkouts,
        );

        // Get or create workout
        const insertedWorkout = similarWorkoutId
          ? (existingWorkouts.find((w) => w.id === similarWorkoutId) ??
            (await createNewWorkout(ctx.s3, workout)))
          : await createNewWorkout(ctx.s3, workout);

        // Create plan day entry
        await db.insert(workoutPlanDays).values({
          planId: workoutPlan.id,
          workoutId: insertedWorkout.id,
          dayNumber,
          completed: false,
        });

        workoutsWithIds.push({
          dayNumber,
          workout: {
            ...workout,
            id: insertedWorkout.id,
          },
        });
      }

      return {
        id: workoutPlan.id,
        startDate: workoutPlan.startDate,
        endDate: workoutPlan.endDate,
        targetCaloriesBurn: weeklyPlan.targetCaloriesBurn,
        workouts: workoutsWithIds,
      };
    }),

  getCurrentWeekPlan: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);

    if (!userId) {
      throw new Error("User not found");
    }

    // Get current active plan
    const [currentPlan] = await db
      .select()
      .from(workoutPlans)
      .where(
        and(
          eq(workoutPlans.userId, userId),
          eq(workoutPlans.status, "active"),
          gte(workoutPlans.endDate, new Date().toISOString()),
        ),
      )
      .execute();

    if (!currentPlan) {
      ctx.logger.error("No active plan found");
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
        const workoutExercisesList = await db.query.workoutExercises.findMany({
          where: eq(workoutExercises.workoutId, day.workout.id),
          orderBy: [desc(workoutExercises.orderIndex)],
        });

        const exercisesWithDetails = await Promise.all(
          workoutExercisesList.map(async (workoutExercise) => {
            const exerciseDetails = await db.query.exercises.findFirst({
              where: eq(exercisesTable.id, workoutExercise.exerciseId),
            });

            return {
              ...workoutExercise,
              name: exerciseDetails?.name ?? "Unknown Exercise",
              description: exerciseDetails?.description,
              targetMuscles: exerciseDetails?.targetMuscles,
              imageUrl: exerciseDetails?.imageUrl,
              videoUrl: exerciseDetails?.videoUrl,
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

    prettyPrint(currentPlan);

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

  completeWorkoutPlan: protectedProcedure
    .input(
      z.object({
        workoutId: z.number(),
        planId: z.number(),
        dayNumber: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { planId, dayNumber, workoutId } = input;
      const userId = Number(ctx.session.user.id);
      // ctx.logger.info(`Completing workout plan ${planId} day ${dayNumber}`);

      // Update workout plan day completion
      const [updatedPlanDay] = await db
        .update(workoutPlanDays)
        .set({
          completed: true,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(workoutPlanDays.workoutId, workoutId),
            eq(workoutPlanDays.planId, planId),
            eq(workoutPlanDays.dayNumber, dayNumber),
          ),
        )
        .returning();

      if (!updatedPlanDay) {
        ctx.logger.error("Failed to update workout plan day", {
          userId,
          planId,
          dayNumber,
          workoutId,
        });
        return {
          success: false,
          message: "Failed to update workout plan day",
        };
      }

      // Update user milestone progress
      const currentMilestone = await db.query.userMilestoneProgress.findFirst({
        where: and(
          eq(userMilestoneProgress.userId, userId),
          eq(userMilestoneProgress.completed, false),
        ),
        orderBy: [desc(userMilestoneProgress.id)],
      });

      if (!currentMilestone) {
        // If no milestone exists, create the first level milestone
        const firstLevel = await db.query.milestoneLevels.findFirst({
          where: eq(milestoneLevels.level, 1),
        });

        if (firstLevel) {
          await db.insert(userMilestoneProgress).values({
            userId,
            levelId: firstLevel.id,
            currentDay: 1,
            completed: false,
          });
        }
      } else {
        const milestoneLevel = await db.query.milestoneLevels.findFirst({
          where: eq(milestoneLevels.id, currentMilestone.levelId),
        });

        if (milestoneLevel) {
          const newDay = currentMilestone.currentDay + 1;
          const isCompleted = newDay >= milestoneLevel.totalDays;

          await db
            .update(userMilestoneProgress)
            .set({
              currentDay: newDay,
              completed: isCompleted,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(userMilestoneProgress.id, currentMilestone.id));

          // If milestone is completed, create next level milestone
          if (isCompleted) {
            const nextLevel = await db.query.milestoneLevels.findFirst({
              where: eq(milestoneLevels.level, milestoneLevel.level + 1),
            });

            if (nextLevel) {
              await db.insert(userMilestoneProgress).values({
                userId,
                levelId: nextLevel.id,
                currentDay: 1,
                completed: false,
              });
            }
          }
        }
      }

      // Update workout plan status if all days are completed
      const allPlanDays = await db
        .select()
        .from(workoutPlanDays)
        .where(eq(workoutPlanDays.planId, planId))
        .execute();

      const allDaysCompleted = allPlanDays.every((day) => day.completed);

      if (allDaysCompleted) {
        await db
          .update(workoutPlans)
          .set({
            status: "completed",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(workoutPlans.id, planId));
      }

      return {
        success: true,
        planDay: updatedPlanDay,
        allDaysCompleted,
      };
    }),

  getUserMilestoneProgress: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);

    const currentMilestone = await db.query.userMilestoneProgress.findFirst({
      where: and(
        eq(userMilestoneProgress.userId, userId),
        eq(userMilestoneProgress.completed, false),
      ),
      orderBy: [desc(userMilestoneProgress.id)],
    });

    if (!currentMilestone) {
      // If no milestone exists, create the first level milestone
      const firstLevel = await db.query.milestoneLevels.findFirst({
        where: eq(milestoneLevels.level, 1),
      });

      if (firstLevel) {
        const [newMilestone] = await db
          .insert(userMilestoneProgress)
          .values({
            userId,
            levelId: firstLevel.id,
            currentDay: 1,
            completed: false,
          })
          .returning();

        if (!newMilestone) {
          throw new Error("Failed to create new milestone");
        }

        return {
          currentDay: newMilestone.currentDay,
          totalDays: firstLevel.totalDays,
          emoji: firstLevel.emoji,
          level: firstLevel.level,
        };
      }
      return null;
    }

    const milestoneLevel = await db.query.milestoneLevels.findFirst({
      where: eq(milestoneLevels.id, currentMilestone.levelId),
    });

    if (!milestoneLevel) {
      return null;
    }

    return {
      currentDay: currentMilestone.currentDay,
      totalDays: milestoneLevel.totalDays,
      emoji: milestoneLevel.emoji,
      level: milestoneLevel.level,
    };
  }),
} satisfies TRPCRouterRecord;
