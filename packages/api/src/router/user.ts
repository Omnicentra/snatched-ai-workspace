import { Readable } from "stream";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import type { BodyRatingResponse } from "@omc/validators";
import {
  fitnessGoals,
  mealPlans,
  mealSchedule,
  recipes,
  user,
  userBodyRatings,
  userImageTransformations,
  workoutPlanDays,
  workoutPlans,
  workouts,
} from "@omc/db/schema";
import { prettyPrint } from "@omc/validators";
import {
  desiredBodyShapeEnum,
  dietaryPreferenceEnum,
  stylePreferenceEnum,
} from "@omc/validators/onboarding";

import type { ImageScansKey } from "../utils/types";
import {
  generateMealPlanWithGemini,
  getOrCreateRecipe,
} from "../lib/nutrition-helpers";
import { createNewWorkoutWithExercises, findSimilarWorkout, generateWeeklyWorkoutPlan } from "../lib/workout-helpers";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { images } from "../utils/benchmark-images";
import {
  analyzeBodyImages,
  detectFace,
  validateUploadedImage,
} from "../utils/gemini";
import { transformImage } from "../utils/openai";

type BodyShapeEnum = keyof typeof images;

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk as Buffer)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export const userRouter = createTRPCRouter({
  /**
   * bodyRating
   * Accepts image URLs and desired body shape to calculate various body-rating scores
   */
  bodyRating: protectedProcedure
    .input(
      z.object({
        imageKeys: z.object({
          front: z.string(),
          side: z.string(),
          back: z.string(),
        }),
        desiredBodyShape: z.enum(Object.keys(images) as [BodyShapeEnum]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Extract urls for each body angle
      const { imageKeys, desiredBodyShape } = input;

      // Format for the analyzeBodyImages function
      const imageData: ImageScansKey[] = [
        { angle: "front", key: imageKeys.front },
        { angle: "side", key: imageKeys.side },
        { angle: "back", key: imageKeys.back },
      ];

      // Run body analyzer with image URLs and desired shape
      try {
        const result = await analyzeBodyImages(imageData, desiredBodyShape);
        // Write the data to userBodyRatings
        await ctx.db.insert(userBodyRatings).values({
          userId: Number(ctx.session.user.id),
          frontImageKey: imageKeys.front,
          sideImageKey: imageKeys.side,
          backImageKey: imageKeys.back,
          bodyRating: result,
        });
        return result;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze body images",
        });
      }
    }),
  generatePhotoDownloadUrl: publicProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { key } = input;
      const command = new GetObjectCommand({
        Bucket: "snatched-ai-bucket",
        Key: key,
      });
      const presignedUrl = await getSignedUrl(ctx.s3, command, {
        // 24 hours
        expiresIn: 86400,
      });
      return presignedUrl;
    }),

  generatePhotoUploadUrl: publicProcedure
    .input(
      z.object({
        deviceId: z.string(),
        photoType: z.enum(["front", "side", "back"]),
        fileType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { deviceId, photoType, fileType } = input;
      prettyPrint(JSON.stringify(input, null, 2));
      try {
        // Generate unique file name
        const fileName = `${uuidv4()}.${fileType.split("/").pop() ?? "jpg"}`;
        console.log(fileName);

        // Create S3 key path
        const key = `temp-users/${deviceId}/${photoType}/${fileName}`;
        console.log(key);

        // Generate presigned URL for direct upload
        const putCommand = new PutObjectCommand({
          Bucket: "snatched-ai-bucket",
          Key: key,
          ContentType: fileType,
        });

        // Generate signed URL that expires in 10 minutes
        const presignedUrl = await getSignedUrl(ctx.s3, putCommand, {
          expiresIn: 600,
        });

        prettyPrint(presignedUrl);

        return {
          presignedUrl,
          key,
          fileName,
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }
    }),

  imageTransformation: protectedProcedure
    .input(
      z.object({
        imageKeys: z.object({
          front: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { imageKeys } = input;

      // Insert initial record with 'pending' status
      const [newTransformation] = await ctx.db
        .insert(userImageTransformations)
        .values({
          userId: Number(ctx.session.user.id),
          inputImageKey: imageKeys.front,
          status: "pending",
        })
        .returning({ id: userImageTransformations.id });

      if (!newTransformation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create initial transformation record",
        });
      }

      const transformationId = newTransformation.id;

      try {
        // Get face coordinates and image buffer from Gemini
        const { coordinates, imageBuffer } = await detectFace(imageKeys.front);
        const command = new GetObjectCommand({
          Bucket: "snatched-ai-bucket",
          Key: imageKeys.front,
        });
        // expires in 3 days
        const currentImageUri = await getSignedUrl(ctx.s3, command, {
          expiresIn: 259200,
        });
        // Transform image using OpenAI
        const { transformedImageKey, transformedImageUri } =
          await transformImage(imageBuffer, coordinates);

        // Update record with 'success' status and transformed image key
        await ctx.db
          .update(userImageTransformations)
          .set({
            transformedImageKey: transformedImageKey,
            faceCoordinates: coordinates, // Store coordinates for debugging if needed
            status: "success",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(userImageTransformations.id, transformationId));

        return {
          currentImageUri,
          transformedImageKey,
          transformedImageUri,
        };
      } catch (error) {
        console.error(error);

        let status = "failed";
        let errorMessage = "Unknown error";

        if (error instanceof Error) {
          errorMessage = error.message;
          // Check for moderation error structure if available
          if (
            "error" in error &&
            typeof error.error === "object" &&
            error.error !== null &&
            "code" in error.error &&
            error.error.code === "moderation_blocked"
          ) {
            status = "moderated";
          }
        }

        // Update record with error status
        await ctx.db
          .update(userImageTransformations)
          .set({
            status: status,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(userImageTransformations.id, transformationId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to transform image: ${errorMessage}`,
        });
      }
    }),

  validateUploadedImage: publicProcedure
    .input(
      z.object({
        imageKey: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { imageKey } = input;

      try {
        return await validateUploadedImage(imageKey);
      } catch (error) {
        console.error("Error validating image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate image",
        });
      }
    }),

  generateBlurredImage: protectedProcedure
    .input(
      z.object({
        imageKey: z.string(),
        blurAmount: z.number().min(1).max(100).default(15),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { imageKey, blurAmount } = input;

      try {
        // Get the original image from S3
        const getCommand = new GetObjectCommand({
          Bucket: "snatched-ai-bucket",
          Key: imageKey,
        });

        const response = await ctx.s3.send(getCommand);
        if (!response.Body) {
          throw new Error("No image data received from S3");
        }

        // Convert stream to buffer
        const imageBuffer = await streamToBuffer(response.Body as Readable);

        // Generate blurred version using Sharp
        const blurredImageBuffer = await sharp(imageBuffer)
          .blur(blurAmount)
          .toBuffer();

        // Generate a new key for the blurred image
        const blurredImageKey = `blurred/${imageKey.split("/").pop()}`;

        // Upload blurred image back to S3
        const putCommand = new PutObjectCommand({
          Bucket: "snatched-ai-bucket",
          Key: blurredImageKey,
          Body: blurredImageBuffer,
          ContentType: "image/jpeg", // Adjust if needed based on input image type
        });

        await ctx.s3.send(putCommand);

        // Generate presigned URLs for both original and blurred images
        const originalImageUrl = await getSignedUrl(ctx.s3, getCommand, {
          expiresIn: 3600, // 1 hour
        });

        const blurredImageCommand = new GetObjectCommand({
          Bucket: "snatched-ai-bucket",
          Key: blurredImageKey,
        });

        const blurredImageUrl = await getSignedUrl(
          ctx.s3,
          blurredImageCommand,
          {
            expiresIn: 3600, // 1 hour
          },
        );

        return {
          originalImageUrl,
          blurredImageUrl,
          blurredImageKey,
        };
      } catch (error) {
        console.error("Error processing image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate blurred image",
        });
      }
    }),

  getBodyRatingByDate: protectedProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { date } = input;
      const dateParts = date.split("T")[0]; // Extract YYYY-MM-DD part

      // Query the latest body rating on or before the given date
      const bodyRating = await ctx.db.query.userBodyRatings.findFirst({
        where: (ratings, { and, eq, lte }) =>
          and(
            eq(ratings.userId, Number(ctx.session.user.id)),
            lte(ratings.createdAt, `${dateParts}T23:59:59.999Z`),
          ),
        orderBy: (ratings, { desc }) => [desc(ratings.createdAt)],
      });

      if (!bodyRating) {
        return null;
      }

      ctx.logger.info("Body rating", { bodyRating });

      return {
        ...bodyRating,
        bodyRating: bodyRating.bodyRating as BodyRatingResponse,
      };
    }),

  updateFitnessGoals: protectedProcedure
    .input(
      z.object({
        timelineWeeks: z.number().default(12),
        desiredShape: desiredBodyShapeEnum,
        regeneratePlans: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      let dbWorkoutPlan: typeof workoutPlans.$inferSelect | undefined =
        undefined;
      // Update fitness goals in the database
      await ctx.db
        .insert(fitnessGoals)
        .values({
          userId: userId,
          timelineWeeks: input.timelineWeeks,
          desiredShape: input.desiredShape,
        })
        .onConflictDoUpdate({
          target: [fitnessGoals.userId],
          set: {
            desiredShape: input.desiredShape,
          },
        });

      if (input.regeneratePlans) {
        // TODO: Implement plan regeneration
        // This would involve calling your AI service to regenerate workout and meal plans
        // based on the new desired shape
        const genWorkoutPlan = await generateWeeklyWorkoutPlan(
          input.desiredShape,
        );
        ctx.logger.info("Generated workout plan", genWorkoutPlan.workouts);
        // Check if there is an active workout plan for the user where the current date is between the start and end date
        dbWorkoutPlan = await ctx.db.query.workoutPlans.findFirst({
          where: (workoutPlans, { and, eq, gte, lte }) =>
            and(
              eq(workoutPlans.userId, userId),
              gte(workoutPlans.startDate, new Date().toISOString()),
              lte(workoutPlans.endDate, new Date().toISOString()),
              eq(workoutPlans.status, "active"),
            ),
        });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 6);

        let result: typeof workoutPlans.$inferSelect[];

        if (dbWorkoutPlan) {
          // Update the workout plan
          result = await ctx.db
            .update(workoutPlans)
            .set({
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              targetCaloriesBurn: genWorkoutPlan.targetCaloriesBurn,
              status: "active",
            })
            .where(eq(workoutPlans.id, dbWorkoutPlan.id))
            .returning();
        } else {
          // Create a new workout plan
          result = await ctx.db.insert(workoutPlans).values({
            userId: userId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            targetCaloriesBurn: genWorkoutPlan.targetCaloriesBurn,
            status: "active",
          }).returning();
        }

        if (!result[0]) {
          throw new Error("Failed to upsert workout plan");
        }

        // Fetch existing workouts for similarity check
        const existingWorkouts = await ctx.db.select().from(workouts).execute();

        // Create workouts and plan days / replace the workout plan days in the database
        const workoutsWithIds = [];
        for (const { dayNumber, workout } of genWorkoutPlan.workouts) {
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

          // Upsert plan day entry
          await ctx.db.insert(workoutPlanDays).values({
            planId: result[0].id,
            workoutId: insertedWorkout.id,
            dayNumber,
            completed: false,
          }).onConflictDoUpdate({
            target: [workoutPlanDays.planId, workoutPlanDays.dayNumber],
            set: {
              workoutId: insertedWorkout.id,
            },
          });

          workoutsWithIds.push({
            dayNumber,
            workout: {
              ...workout,
              id: insertedWorkout.id,
            },
          });
        }
      }
      return { success: true };
    }),

  updateDietaryPreferences: protectedProcedure
    .input(
      z.object({
        diet: dietaryPreferenceEnum,
        regeneratePlans: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Update dietary preferences in the database
      const [dbUser] = await ctx.db
        .update(user)
        .set({
          dietaryPreference: input.diet,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(user.id, userId))
        .returning();

      if (input.regeneratePlans) {
        // TODO: Implement meal plan regeneration
        // This would involve calling your AI service to regenerate meal plans
        // based on the new dietary preferences\
        const genMealPlan = await generateMealPlanWithGemini(input.diet);
        console.log(genMealPlan);
        // Replace the meal plan in the database or insert if one doesn't exist for the current date
        const [dbMealPlan] = await ctx.db
          .insert(mealPlans)
          .values({
            userId: userId,
            date: new Date().toISOString(),
            targetCalories: genMealPlan.targetCalories.toFixed(2),
            targetProtein: genMealPlan.targetProtein.toFixed(2),
            targetCarbs: genMealPlan.targetCarbs.toFixed(2),
            targetFats: genMealPlan.targetFat.toFixed(2),
          })
          .onConflictDoUpdate({
            target: [mealPlans.userId, mealPlans.date],
            set: {
              targetCalories: genMealPlan.targetCalories.toFixed(2),
              targetProtein: genMealPlan.targetProtein.toFixed(2),
              targetCarbs: genMealPlan.targetCarbs.toFixed(2),
              targetFats: genMealPlan.targetFat.toFixed(2),
            },
          })
          .returning();

        if (!dbMealPlan) {
          throw new Error("Failed to upsert meal plan");
        }

        // Get existing recipes for similarity check
        const existingRecipes = await ctx.db.select().from(recipes).execute();

        // Process each meal
        await Promise.all(
          genMealPlan.meals.map(async (meal) => {
            // Get or create recipe
            const recipe = await getOrCreateRecipe(
              ctx.s3,
              meal,
              existingRecipes,
            );

            // Upsert meal schedule entry
            await ctx.db
              .insert(mealSchedule)
              .values({
                mealPlanId: dbMealPlan.id,
                recipeId: recipe.id,
                mealType: meal.category.toLowerCase(),
                scheduledTime: meal.time,
                completed: false,
              })
              .onConflictDoUpdate({
                target: [
                  mealSchedule.mealPlanId,
                  mealSchedule.mealType,
                  mealSchedule.scheduledTime,
                ],
                set: {
                  recipeId: recipe.id,
                },
              });

            return {
              ...meal,
              id: recipe.id,
            };
          }),
        );
      }

      return dbUser;
    }),
});
