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
  user,
  userRecipes,
  session as userSession,
  userWorkoutProgress,
  workoutPlans,
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

      // Delete all user data in a transaction
      await db.transaction(async (tx) => {
        await tx.delete(mealPlans).where(eq(mealPlans.userId, userId));
        await tx
          .delete(userWorkoutProgress)
          .where(eq(userWorkoutProgress.userId, userId));
        await tx.delete(workoutPlans).where(eq(workoutPlans.userId, userId));
        await tx.delete(foodCravings).where(eq(foodCravings.userId, userId));
        await tx.delete(userRecipes).where(eq(userRecipes.userId, userId));
        await tx
          .delete(bodyMeasurements)
          .where(eq(bodyMeasurements.userId, userId));
        await tx
          .delete(bodyConsiderations)
          .where(eq(bodyConsiderations.userId, userId));
        await tx
          .delete(healthConditions)
          .where(eq(healthConditions.userId, userId));
        await tx.delete(fitnessGoals).where(eq(fitnessGoals.userId, userId));
        await tx.delete(fitnessBlockers).where(eq(fitnessBlockers.userId, userId));
        await tx.delete(previousExperiences).where(eq(previousExperiences.userId, userId));
        await tx.delete(userDevices).where(eq(userDevices.userId, userId));
        await tx.delete(userMilestoneProgress).where(eq(userMilestoneProgress.userId, userId));

        // Delete user's sessions
        await tx.delete(userSession).where(eq(userSession.userId, userId));

        // Delete user's accounts
        await tx.delete(account).where(eq(account.userId, userId));

        // Finally, delete the user
        await tx.delete(user).where(eq(user.id, userId));
      });

      return { message: "Account deleted successfully" };
    }),
}); 