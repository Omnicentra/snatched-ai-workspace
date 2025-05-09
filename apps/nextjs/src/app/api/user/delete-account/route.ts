import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@omc/auth";
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
} from "@omc/db/schema";

interface DeleteAccountRequest {
  email: string;
}

export async function POST(request: Request) {
  try {
    const currentSession = await auth.api.getSession({
      headers: headers(),
    });

    if (!currentSession?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { email } = (await request.json()) as DeleteAccountRequest;

    if (!email) {
      return new NextResponse(
        JSON.stringify({ message: "Email is required" }),
        { status: 400 }
      );
    }

    // Verify that the email matches the current user's email
    if (email !== currentSession.user.email) {
      return new NextResponse(
        JSON.stringify({ message: "Email does not match your account" }),
        { status: 400 }
      );
    }

    const userId = Number(currentSession.user.id);

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
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
