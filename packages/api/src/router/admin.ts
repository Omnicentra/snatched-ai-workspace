import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@omc/db/client";
import {
  account,
  bodyConsiderations,
  bodyMeasurements,
  fitnessGoals,
  foodCravings,
  healthConditions,
  mealPlans,
  mealSchedule,
  user,
  userRecipes,
  session as userSession,
  userWorkoutProgress,
  workoutPlans,
  workoutPlanDays,
  previousExperiences,
  fitnessBlockers,
  userDevices,
  userMilestoneProgress,
} from "@omc/db/schema";

import { adminProcedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
  deleteAccount: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email } = input;

      // Find the user by email
      const userToDelete = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (!userToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const userId = userToDelete.id;

      try {
        // Delete all user data in the correct order to respect foreign key constraints
        // First, delete from tables that depend on meal_plans
        const userMealPlans = await db.query.mealPlans.findMany({
          where: eq(mealPlans.userId, userId),
        });
        
        for (const mealPlan of userMealPlans) {
          await db.delete(mealSchedule).where(eq(mealSchedule.mealPlanId, mealPlan.id));
        }

        // Delete from tables that depend on workout_plans
        const userWorkoutPlans = await db.query.workoutPlans.findMany({
          where: eq(workoutPlans.userId, userId),
        });

        for (const workoutPlan of userWorkoutPlans) {
          await db.delete(workoutPlanDays).where(eq(workoutPlanDays.planId, workoutPlan.id));
        }

        // Now delete the main user data
        await db.delete(mealPlans).where(eq(mealPlans.userId, userId));
        await db.delete(userWorkoutProgress).where(eq(userWorkoutProgress.userId, userId));
        await db.delete(workoutPlans).where(eq(workoutPlans.userId, userId));
        await db.delete(foodCravings).where(eq(foodCravings.userId, userId));
        await db.delete(userRecipes).where(eq(userRecipes.userId, userId));
        await db.delete(bodyMeasurements).where(eq(bodyMeasurements.userId, userId));
        await db.delete(bodyConsiderations).where(eq(bodyConsiderations.userId, userId));
        await db.delete(healthConditions).where(eq(healthConditions.userId, userId));
        await db.delete(fitnessGoals).where(eq(fitnessGoals.userId, userId));
        await db.delete(fitnessBlockers).where(eq(fitnessBlockers.userId, userId));
        await db.delete(previousExperiences).where(eq(previousExperiences.userId, userId));
        await db.delete(userDevices).where(eq(userDevices.userId, userId));
        await db.delete(userMilestoneProgress).where(eq(userMilestoneProgress.userId, userId));

        // Delete user's sessions
        await db.delete(userSession).where(eq(userSession.userId, userId));

        // Delete user's accounts
        await db.delete(account).where(eq(account.userId, userId));

        // Finally, delete the user
        await db.delete(user).where(eq(user.id, userId));

        return { message: "Account deleted successfully" };
      } catch (error) {
        console.error("Error deleting account:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete account. Please try again.",
        });
      }
    }),
}); 