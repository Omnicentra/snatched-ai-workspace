import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { GoogleGenAI, Type } from "@google/genai";
import { db } from "@omc/db/client";
import { workouts, workoutExercises, exercises as exercisesTable, workoutCategories as _workoutCategories, userWorkoutProgress } from "@omc/db/schema";
import { eq, desc, sql } from "drizzle-orm";

import { publicProcedure, adminProcedure } from "../trpc";

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

type Workout = z.infer<typeof workoutSchema>;

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
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
      searchTerm: z.string().optional(),
    }))
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
              sql`LOWER(${exercises.name}) LIKE ${searchPattern} OR LOWER(${exercises.targetMuscles}) LIKE ${searchPattern}`
          });
        } else {
          exerciseQuery = await db.query.exercises.findMany({
            limit,
            offset
          });
        }
        
        const countResult = await db.select({ count: sql`COUNT(*)` }).from(exercisesTable);
        const totalCount = Number(countResult[0]?.count ?? 0);
        
        return {
          exercises: exerciseQuery,
          pagination: {
            total: totalCount,
            offset,
            limit,
            hasMore: offset + exerciseQuery.length < totalCount,
          }
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
    .input(z.object({
      workoutId: z.number(),
    }))
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
        })
      );

      return {
        ...workout,
        exercises: exercisesWithDetails,
      };
    }),
  
  getDailyWorkout: publicProcedure
    .output(workoutSchema.extend({ id: z.number() }))
    .query(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents:
          "Generate a daily workout plan as JSON. Provide title (string), description (string), durationMinutes (number), difficultyLevel (string: e.g. beginner, intermediate, advanced), caloriesBurn (number), and exercises (array). For each exercise, include: name (string), targetMuscles (string), sets (number), reps (number), restSeconds (number). Output valid JSON only.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
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
                  required: ["name", "targetMuscles", "sets", "reps", "restSeconds"],
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
      });

      if (!response.text) {
        throw new Error("No response from Gemini");
      }

      const workout = JSON.parse(response.text) as Workout;

      const [insertedWorkout] = await db
        .insert(workouts)
        .values({
          title: workout.title,
          description: workout.description,
          durationMinutes: workout.durationMinutes,
          difficultyLevel: workout.difficultyLevel,
          caloriesBurn: workout.caloriesBurn,
        })
        .returning({ id: workouts.id });

      if (!insertedWorkout) {
        throw new Error("Failed to insert workout");
      }

      await Promise.all(
        workout.exercises.map(async (exercise, index) => {
          const [insertedExercise] = await db
            .insert(exercisesTable)
            .values({
              name: exercise.name,
              targetMuscles: exercise.targetMuscles,
            })
            .returning({ id: exercisesTable.id });

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
        })
      );

      return {
        id: insertedWorkout.id,
        ...workout,
      };
    }),
  insertWorkout: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(100),
      description: z.string().optional(),
      durationMinutes: z.number().min(1),
      difficultyLevel: z.string().refine(
        (val) => ["beginner", "intermediate", "advanced"].includes(val.toLowerCase()),
        "Difficulty level must be beginner, intermediate, or advanced"
      ),
      caloriesBurn: z.number().min(0).optional(),
      rating: z.number().min(0).max(5).optional().transform(val => val?.toString()),
      imageUrl: z.string().url().optional(),
      categoryId: z.number().optional(),
    }))
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
    .input(z.object({
      workoutId: z.number(),
      exerciseId: z.number(),
      sets: z.number().min(1),
      reps: z.number().min(1),
      restSeconds: z.number().min(0),
      orderIndex: z.number().min(1).optional(),
    }))
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
    .input(z.object({
      workoutId: z.number(),
      exercises: z.array(z.object({
        exerciseId: z.number(),
        sets: z.number().min(1),
        reps: z.number().min(1),
        restSeconds: z.number().min(0),
        orderIndex: z.number().min(1).optional(),
      })),
      replaceExisting: z.boolean().default(false),
    }))
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
          await db.delete(workoutExercises).where(eq(workoutExercises.workoutId, input.workoutId));
        }

        let maxOrderIndex = 0;
        if (input.exercises.some(e => !e.orderIndex)) {
          const highestOrderExercise = await db.query.workoutExercises.findFirst({
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

            const orderIndex = exerciseInput.orderIndex ?? maxOrderIndex + index + 1;

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
          })
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
    .input(z.object({
      userId: z.number(),
      workoutId: z.number(),
      durationMinutes: z.number().min(1),
      caloriesBurned: z.number().optional(),
    }))
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
    .input(z.object({
      userId: z.number(),
      period: z.enum(["week", "month", "all"]).optional().default("all"),
    }))
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
            return period === "all" ? userFilter : sql`${userFilter} AND ${dateFilter}`;
          },
          orderBy: [desc(userWorkoutProgress.completedAt)],
        });
        
        // Calculate basic stats
        const totalWorkouts = workoutRecords.length;
        const totalDuration = workoutRecords.reduce((sum, record) => sum + (record.durationMinutes ?? 0), 0);
        const totalCalories = workoutRecords.reduce((sum, record) => sum + (record.caloriesBurned ?? 0), 0);
        
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
} satisfies TRPCRouterRecord;
