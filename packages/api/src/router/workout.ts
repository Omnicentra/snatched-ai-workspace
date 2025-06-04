import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@omc/db/client";
import {
  exercises,
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
  workoutToClass
} from "@omc/db/schema";
import { prettyPrint } from "@omc/validators";
import { exerciseSchema } from "@omc/validators/workout";
import { createNewWorkoutWithExercises, findSimilarWorkout, generateWeeklyWorkoutPlan } from "../lib/workout-helpers";

import type { DesiredShape } from "@omc/validators/onboarding";
import { adminProcedure, protectedProcedure, publicProcedure } from "../trpc";


export const workoutRouter = {
  getWorkouts: publicProcedure.query(async ({ ctx }) => {
    try {
      const workoutResults = await ctx.db
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

  getWorkoutCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.query.workoutCategories.findMany();
    return categories;
  }),

  getWorkoutClasses: publicProcedure.query(async ({ ctx }) => {
    try {
      const classes = await ctx.db.query.workoutClasses.findMany();

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

      const workout = await ctx.db.query.workouts.findFirst({
        where: eq(workouts.id, workoutId),
      });

      // check if the user has an active workout plan
      const workoutPlan = await ctx.db.query.workoutPlans.findFirst({
        where: and(
          eq(workoutPlans.userId, Number(ctx.session.user.id)),
          eq(workoutPlans.status, "active"),
          gte(workoutPlans.endDate, new Date().toISOString()),
        ),
      });

      // check if the workout is in the workout plan days
      if (workoutPlan) {
        workoutPlanDay = await ctx.db.query.workoutPlanDays.findFirst({
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

      const workoutExercisesData = await ctx.db.query.workoutExercises.findMany({
        where: eq(workoutExercises.workoutId, workoutId),
        orderBy: [desc(workoutExercises.orderIndex)],
      });

      const exercisesWithDetails = await Promise.all(
        workoutExercisesData.map(async (workoutExercise) => {
          const exercise = await ctx.db.query.exercises.findFirst({
            where: eq(exercises.id, workoutExercise.exerciseId),
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
    .mutation(async ({ input, ctx }) => {
      try {
        const [insertedWorkout] = await ctx.db
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
        const workout = await ctx.db.query.workouts.findFirst({
          where: eq(workouts.id, workoutId),
        });

        if (!workout) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Workout with ID ${workoutId} not found`,
          });
        }

        // Record the workout progress
        const [progressRecord] = await ctx.db
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
        const userId = Number(ctx.session.user.id);

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
        const workoutRecords = await ctx.db.query.userWorkoutProgress.findMany({
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
      // Get fitness goals
      const userId = Number(ctx.session.user.id);

      // check if the user has an active workout plan
      const [activeWorkoutPlan] = await ctx.db
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

      const [fitnessGoal] = await ctx.db
        .select()
        .from(fitnessGoals)
        .where(eq(fitnessGoals.userId, userId))
        .execute();

      // Generate weekly workout plan using helper function
      const generatedPlan = await generateWeeklyWorkoutPlan(fitnessGoal?.desiredShape as DesiredShape);

      // Fetch existing workouts for similarity check
      const existingWorkouts = await db.select().from(workouts).execute();

      // Create workout plan
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6);

      const [workoutPlan] = await ctx.db
        .insert(workoutPlans)
        .values({
          userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          targetCaloriesBurn: generatedPlan.targetCaloriesBurn,
          status: "active",
        })
        .returning();

      if (!workoutPlan) {
        throw new Error("Failed to create workout plan");
      }

      // Create workouts and plan days
      const workoutsWithIds = [];
      for (const { dayNumber, workout } of generatedPlan.workouts) {
        // Check for similar existing workout
        const similarWorkoutId = await findSimilarWorkout(
          workout,
          existingWorkouts.slice(0, 50),
        );

        // Get or create workout
        const insertedWorkout = similarWorkoutId
          ? (existingWorkouts.find((w) => w.id === similarWorkoutId) ??
              await createNewWorkoutWithExercises(ctx.s3, workout))
          : await createNewWorkoutWithExercises(ctx.s3, workout);

        // Create plan day entry
        await ctx.db.insert(workoutPlanDays).values({
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
        targetCaloriesBurn: generatedPlan.targetCaloriesBurn,
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
              where: eq(exercises.id, workoutExercise.exerciseId),
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

    const milestoneLevel = await ctx.db.query.milestoneLevels.findFirst({
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
