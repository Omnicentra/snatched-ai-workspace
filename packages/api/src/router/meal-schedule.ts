import { z } from "zod";

import { and, eq, sql } from "@omc/db";
import { mealPlans, mealSchedule, recipes } from "@omc/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const mealScheduleRouter = createTRPCRouter({
  getRecentlyLoggedMeals: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);

    // Get meals for the current day
    // TODO: This is a temporary solution to get the meals for the current day
    const today = new Date().toISOString().split("T")[0];

    const recentMeals = await ctx.db
      .select({
        id: mealSchedule.id,
        mealType: mealSchedule.mealType,
        scheduledTime: mealSchedule.scheduledTime,
        completedAt: mealSchedule.updatedAt,
        recipe: recipes,
      })
      .from(mealSchedule)
      .innerJoin(recipes, eq(mealSchedule.recipeId, recipes.id))
      .innerJoin(mealPlans, eq(mealSchedule.mealPlanId, mealPlans.id))
      .where(
        and(
          eq(mealPlans.userId, userId),
          eq(mealSchedule.completed, true),
          sql`${mealSchedule.updatedAt} >= ${today}::timestamp`,
        ),
      )
      .orderBy(sql`${mealSchedule.updatedAt} DESC`)
      .execute();

    return recentMeals;
  }),
  toggleMealCompletion: protectedProcedure
    .input(
      z.object({
        mealScheduleId: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Get current meal schedule
      const [currentMeal] = await ctx.db
        .select()
        .from(mealSchedule)
        .where(eq(mealSchedule.id, input.mealScheduleId))
        .execute();

      if (!currentMeal) {
        throw new Error("Meal schedule not found");
      }

      // Toggle completion status
      const [updatedMeal] = await ctx.db
        .update(mealSchedule)
        .set({
          completed: !currentMeal.completed,
          completedAt: !currentMeal.completed ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(mealSchedule.id, input.mealScheduleId))
        .returning();

      return updatedMeal;
    }),
  toggleMealCompletionByRecipeId: protectedProcedure
    .input(
      z.object({
        recipeId: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { recipeId } = input;

      // Get the meal schedule for the recipe for the current day
      const [dbMealSchedule] = await ctx.db
        .select()
        .from(mealSchedule)
        .where(
          and(
            eq(mealSchedule.recipeId, recipeId),
            sql`DATE(${mealSchedule.createdAt}) = CURRENT_DATE`,
          ),
        )
        .execute();

      if (!dbMealSchedule) {
        ctx.logger.warn(
          `No meal schedule found for recipe ${recipeId}`,
        );
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meal schedule not found",
        });
      }

      // Toggle completion status
      const [updatedMeal] = await ctx.db
        .update(mealSchedule)
        .set({
          completed: !dbMealSchedule.completed,
          completedAt: !dbMealSchedule.completed ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(mealSchedule.id, dbMealSchedule.id))
        .returning();

      return updatedMeal;
    }),
});
