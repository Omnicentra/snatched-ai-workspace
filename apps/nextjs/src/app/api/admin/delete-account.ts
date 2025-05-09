import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";

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

interface DeleteAccountRequest {
  email: string;
}

export async function POST(request: Request) {
  try {
    const adminEmail = headers().get("x-admin-email");
    console.log("adminEmail", adminEmail);

    if (!adminEmail?.endsWith("@omnicentra.com")) {
      Sentry.captureException(new Error("Unauthorized header"));
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { email } = (await request.json()) as DeleteAccountRequest;

    if (!email) {
      Sentry.captureException(new Error("Email is required"));
      return new NextResponse(
        JSON.stringify({ message: "Email is required" }),
        { status: 400 }
      );
    }

    // Find the user by email
    const userToDelete = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!userToDelete) {
      Sentry.captureException(new Error("User not found"));
      return new NextResponse(
        JSON.stringify({ message: "User not found" }),
        { status: 404 }
      );
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

    return new NextResponse(
      JSON.stringify({ message: "Account deleted successfully" }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting account:", error);
    Sentry.captureException(error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
