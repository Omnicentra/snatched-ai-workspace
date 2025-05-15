import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import sharp from "sharp";
import { Readable } from "stream";

import { prettyPrint } from "@omc/validators";
import { userBodyRatings, userImageTransformations } from "@omc/db/schema";
import { eq } from "drizzle-orm";

import type { ImageScansKey } from "../utils/types";
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
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
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
      console.log(JSON.stringify(input, null, 2));
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
      prettyPrint(input);
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
      const [newTransformation] = await ctx.db.insert(userImageTransformations).values({
        userId: Number(ctx.session.user.id),
        inputImageKey: imageKeys.front,
        status: 'pending',
      }).returning({ id: userImageTransformations.id });

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
        await ctx.db.update(userImageTransformations)
          .set({
            transformedImageKey: transformedImageKey,
            faceCoordinates: coordinates, // Store coordinates for debugging if needed
            status: 'success',
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

        let status = 'failed';
        let errorMessage = 'Unknown error';

        if (error instanceof Error) {
          errorMessage = error.message;
          // Check for moderation error structure if available
          if ('error' in error && typeof error.error === 'object' && error.error !== null && 'code' in error.error && error.error.code === 'moderation_blocked') {
             status = 'moderated';
          }
        }

        // Update record with error status
        await ctx.db.update(userImageTransformations)
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
        const blurredImageKey = `blurred/${imageKey.split('/').pop()}`;

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

        const blurredImageUrl = await getSignedUrl(ctx.s3, blurredImageCommand, {
          expiresIn: 3600, // 1 hour
        });

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
});
