import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@omc/db/client";
import {
  exercises as exercisesTable,
  workoutExercises,
  workouts,
} from "@omc/db/schema";

import { adminProcedure, publicProcedure } from "../trpc";

export const exerciseRouter = {
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
} satisfies TRPCRouterRecord; 