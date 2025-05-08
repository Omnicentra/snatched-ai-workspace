import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prettyPrint } from "@omc/validators";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { images } from "../utils/benchmark-images";
import { analyzeBodyImages, validateUploadedImage } from "../utils/gemini";
import { detectFace } from "../utils/gemini";
import { transformImage } from "../utils/openai";
import type { ImageScansKey } from "../utils/types";

type BodyShapeEnum = keyof typeof images;

export const userRouter = createTRPCRouter({
  /**
   * bodyRating
   * Accepts image URLs and desired body shape to calculate various body-rating scores
   */
  bodyRating: publicProcedure
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
    .mutation(async ({ input }) => {
      console.log(JSON.stringify(input, null, 2));
      // Extract urls for each body angle
      const { imageKeys, desiredBodyShape } = input;
      
      // Format for the analyzeBodyImages function
      const imageData : ImageScansKey[] = [
        { angle: 'front', key: imageKeys.front },
        { angle: 'side', key: imageKeys.side },
        { angle: 'back', key: imageKeys.back },
      ];

      // Run body analyzer with image URLs and desired shape
      try {
        return analyzeBodyImages(imageData, desiredBodyShape);
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze body images",
        });
      }
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

  imageTransformation: publicProcedure
    .input(
      z.object({
        imageKeys: z.object({
          front: z.string(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { imageKeys } = input;
      try {
        // Get face coordinates and image buffer from Gemini
        const { coordinates, imageBuffer } = await detectFace(imageKeys.front);
        
        // Transform image using OpenAI
        const transformedImageKey = await transformImage(imageBuffer, coordinates);
        
        return {
          transformedImageKey,
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to transform image",
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
        console.error('Error validating image:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate image",
        });
      }
    }),
});
