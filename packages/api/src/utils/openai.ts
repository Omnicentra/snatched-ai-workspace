import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import OpenAI from "openai";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

import type { FaceCoordinates } from "./gemini";
import { s3Client } from "./gemini";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { sleep } from "@omc/validators";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transformImage(
  imageBuffer: Buffer,
  faceCoordinates: FaceCoordinates,
) {
  try {
    const imageMetadata = await sharp(imageBuffer).metadata();

    if (!imageMetadata.width || !imageMetadata.height) {
      throw new Error("Could not get image dimensions");
    }

    // Clamp coordinates to image boundaries
    const clampedCoordinates = {
      xmin: Math.max(
        0,
        Math.min(faceCoordinates.xmin, imageMetadata.width - 1),
      ),
      ymin: Math.max(
        0,
        Math.min(faceCoordinates.ymin, imageMetadata.height - 1),
      ),
      xmax: Math.max(
        0,
        Math.min(faceCoordinates.xmax, imageMetadata.width - 1),
      ),
      ymax: Math.max(
        0,
        Math.min(faceCoordinates.ymax, imageMetadata.height - 1),
      ),
    };

    // Ensure width and height are at least 1 pixel
    const width = Math.max(
      1,
      Math.round(clampedCoordinates.xmax - clampedCoordinates.xmin),
    );
    const height = Math.max(
      1,
      Math.round(clampedCoordinates.ymax - clampedCoordinates.ymin),
    );

    // Crop and resize the face
    const faceBuffer = await sharp(imageBuffer)
      .extract({
        left: Math.round(clampedCoordinates.xmin),
        top: Math.round(clampedCoordinates.ymin),
        width,
        height,
      })
      .resize(512, 512, {
        fit: "cover",
        position: "top",
      })
      .toBuffer();

    // Create a File object for OpenAI
    const faceFile = new File([faceBuffer], "face.jpg", { type: "image/jpeg" });

    // Call OpenAI to transform the image
    const response = await client.images.edit({
      model: "gpt-image-1",
      image: faceFile,
      prompt:
        "Generate an image of a person with a hourglass figure that has this face. Their full body should be visible. This is a transformation of the person after successfully following a workout regiment.",
      quality: "low",
      size: "1024x1536",
    });

    if (!response.data?.[0]?.b64_json) {
      throw new Error("No image data in OpenAI response");
    }

    // Convert base64 to buffer
    const transformedImageBuffer = Buffer.from(
      response.data[0].b64_json,
      "base64",
    );

    // Upload to S3
    const outputKey = `transformed-images/${uuidv4()}.png`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: "snatched-ai-bucket",
      Key: outputKey,
      Body: transformedImageBuffer,
      ContentType: "image/png",
    }));

    const command = new GetObjectCommand({
      Bucket: "snatched-ai-bucket",
      Key: outputKey,
    });

    await sleep(500);

    // expires in 3 days
    const presignedUrl = await getSignedUrl(
      s3Client,
      command,
      {
        expiresIn: 259200,
      },
    );

    return {
      transformedImageKey: outputKey,
      transformedImageUri: presignedUrl,
    };
  } catch (error) {
    console.error("Error transforming image:", error);
    throw error;
  }
}
