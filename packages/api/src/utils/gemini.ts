import { GoogleGenAI, createUserContent, createPartFromUri, Type } from "@google/genai";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { images } from "./benchmark-images";
import sharp from "sharp";
import { env } from "@omc/auth/env";
import type { ImageScansKey } from "./types";
import type { BodyRatingResponse } from "@omc/validators";
import { desiredBodyShapeEnum } from "@omc/validators/onboarding";
import { z } from "zod";
import { prettyPrint } from "@omc/validators";

const s3Client = new S3Client({
  region: "us-east-1"
});

export { s3Client };

const BUCKET_NAME = "snatched-ai-bucket";

const ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY });

// Image optimization constants
const MAX_WIDTH = 800;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 80;

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();
}

export async function getImageFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  const response = await s3Client.send(command);
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as unknown as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return optimizeImage(buffer);
}

async function getBenchmarkImage(desiredBodyShape: keyof typeof images): Promise<string> {
  const imageKey = images[desiredBodyShape];

  try {
    // Try to get the file from Gemini first
    const listResponse = await ai.files.list({ config: { pageSize: 10 } });
    for await (const file of listResponse) {
      if (file.name === imageKey) {
        const uri = file.uri;
        if (!uri) {
          throw new Error("File URI is undefined");
        }
        return uri;
      }
    }

    // If not found, upload it
    const imageBuffer = await getImageFromS3(imageKey);
    const uploadedFile = await ai.files.upload({
      file: new Blob([imageBuffer], { type: 'image/jpeg' }),
      config: { mimeType: "image/jpeg" },
    });
    const uri = uploadedFile.uri;
    if (!uri) {
      throw new Error("Uploaded file URI is undefined");
    }
    return uri;
  } catch (error) {
    console.error("Error handling benchmark image:", error);
    throw error;
  }
}

async function processUserImages(imageKeys: ImageScansKey[]): Promise<{ inlineData: { mimeType: string; data: string } }[]> {
  const processedImages = await Promise.all(
    imageKeys.map(async ({key}) => {
      const imageBuffer = await getImageFromS3(key);
      const base64ImageData = imageBuffer.toString('base64');
      return {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64ImageData,
        },
      };
    })
  );
  return processedImages;
}

export async function analyzeBodyImages(
  imageKeys: ImageScansKey[],
  desiredBodyShape: z.infer<typeof desiredBodyShapeEnum>
): Promise<BodyRatingResponse> {
  try {
    const benchmarkImageUri = await getBenchmarkImage(desiredBodyShape);
    const userImages = await processUserImages(imageKeys);


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: createUserContent([
        "Analyze these body images and provide detailed metrics. The first three images are the user's front, back, and side views. The last image is the benchmark. Provide scores out of 100. The benchmark image has a score of 95 for all attributes. Also provide a list of up to 3 issues that are preventing the user from achieving the desired body shape.",
        ...userImages,
        createPartFromUri(benchmarkImageUri, "image/jpeg"),
      ]),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentSnatchedScore: { type: Type.NUMBER },
            potentialSnatchedScore: { type: Type.NUMBER },
            potentialWaistReductionInches: { type: Type.NUMBER },
            waistDefinition: { type: Type.NUMBER },
            hipCurve: { type: Type.NUMBER },
            gluteShape: { type: Type.NUMBER },
            posture: { type: Type.NUMBER },
            armShape: { type: Type.NUMBER },
            backDefinition: { type: Type.NUMBER },
            issue1: { type: Type.STRING, nullable: true },
            issue2: { type: Type.STRING, nullable: true },
            issue3: { type: Type.STRING, nullable: true }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const result = JSON.parse(response.text) as BodyRatingResponse;

    prettyPrint(result);

    return result;
  } catch (error) {
    console.error("Error analyzing body images:", error);
    throw error;
  }
}

export interface FaceCoordinates {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface FaceDetectionResult {
  coordinates: FaceCoordinates;
  imageBuffer: Buffer;
}

export async function detectFace(imageKey: string): Promise<FaceDetectionResult> {
  try {
    const imageBuffer = await getImageFromS3(imageKey);
    const base64ImageData = imageBuffer.toString('base64');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: createUserContent([
        "Detect the face in this image. Return the bounding box coordinates that include the entire face from the top of the head to the chin, and from ear to ear. The face should be centered in the frame. The box_2d should be [ymin, xmin, ymax, xmax] normalized to 0-1000.",
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64ImageData,
          },
        },
      ]),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            box_2d: { 
              type: Type.ARRAY,
              items: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    interface GeminiResponse {
      box_2d: [number, number, number, number];
    }

    const result = JSON.parse(response.text) as GeminiResponse;
    let [ymin, xmin, ymax, xmax] = result.box_2d;


    // Ensure coordinates are properly ordered
    if (xmax < xmin) {
      [xmin, xmax] = [xmax, xmin];
    }
    if (ymax < ymin) {
      [ymin, ymax] = [ymax, ymin];
    }

    // Validate coordinate ranges
    if (xmin < 0 || xmax > 1000 || ymin < 0 || ymax > 1000) {
      throw new Error("Invalid coordinate ranges from Gemini");
    }

    // Convert normalized coordinates (0-1000) to pixel coordinates
    const image = await sharp(imageBuffer).metadata();
    if (!image.width || !image.height) {
      throw new Error("Could not get image dimensions");
    }


    // Convert normalized coordinates (0-1000) to pixel coordinates
    const convertedCoordinates = {
      ymin: (ymin / 1000) * image.height,
      xmin: (xmin / 1000) * image.width,
      ymax: (ymax / 1000) * image.height,
      xmax: (xmax / 1000) * image.width,
    };

    // Calculate face center and dimensions
    const faceWidth = convertedCoordinates.xmax - convertedCoordinates.xmin;
    const faceHeight = convertedCoordinates.ymax - convertedCoordinates.ymin;

    // Validate face dimensions
    if (faceWidth <= 0 || faceHeight <= 0) {
      throw new Error("Invalid face dimensions detected");
    }

    // Calculate the horizontal center of the face
    const faceCenterX = convertedCoordinates.xmin + (faceWidth / 2);

    // Add generous padding around the face
    const padding = {
      x: faceWidth * 0.5,  // 50% padding on each side
      y: {
        top: faceHeight * 0.8,  // 80% padding above
        bottom: faceHeight * 0.3  // 30% padding below
      }
    };

    // Calculate the crop coordinates with padding
    const bufferedCoordinates = {
      xmin: Math.max(0, faceCenterX - (faceWidth / 2) - padding.x),
      ymin: Math.max(0, convertedCoordinates.ymin - padding.y.top),
      xmax: Math.min(image.width, faceCenterX + (faceWidth / 2) + padding.x),
      ymax: Math.min(image.height, convertedCoordinates.ymax + padding.y.bottom),
    };


    return {
      coordinates: bufferedCoordinates,
      imageBuffer
    };
  } catch (error) {
    console.error("Error detecting face:", error);
    throw error;
  }
}

export interface ImageValidationResponse {
  isValid: boolean;
  rejectionReason: string;
}

export async function validateUploadedImage(imageKey: string): Promise<ImageValidationResponse> {
  try {
    const imageBuffer = await getImageFromS3(imageKey);
    const base64Image = imageBuffer.toString('base64');

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: createUserContent([
        "Analyze this image and determine if it features a person. If it doesn't feature a person, provide a brief reason why. The image should be a clear photo of a person's body.",
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
      ]),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            rejectionReason: { type: Type.STRING },
          }
        }
      }
    });

    if (!geminiResponse.text) {
      throw new Error("No response from Gemini AI");
    }

    return JSON.parse(geminiResponse.text) as ImageValidationResponse;
  } catch (error) {
    console.error("Error validating image:", error);
    throw error;
  }
} 