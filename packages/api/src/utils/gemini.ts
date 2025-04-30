import { GoogleGenAI, createUserContent, createPartFromUri, Type } from "@google/genai";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { images } from "./benchmark-images";
import sharp from "sharp";
import { env } from "@omc/auth/env";

const s3Client = new S3Client({
  region: "us-east-1"
});

const BUCKET_NAME = "snatched-ai-bucket";

const ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY });

// Image optimization constants
const MAX_WIDTH = 800;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 80;

export interface BodyRatingResponse {
  imageRejected: boolean;
  imageRejectionReason: string | null;
  currentSnatchedScore: number | null;
  potentialSnatchedScore: number | null;
  potentialWaistReductionInches: number | null;
  glowUpOdds: number | null;
  transformationComplete: number | null;
  waistDefinition: number | null;
  hipCurve: number | null;
  gluteShape: number | null;
  posture: number | null;
  armShape: number | null;
  backDefinition: number | null;
}

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();
}

async function getImageFromS3(key: string): Promise<Buffer> {
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

async function processUserImages(imageKeys: string[]): Promise<{ inlineData: { mimeType: string; data: string } }[]> {
  const processedImages = await Promise.all(
    imageKeys.map(async (key) => {
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
  imageUrls: string[],
  desiredBodyShape: keyof typeof images
): Promise<BodyRatingResponse> {
  try {
    const benchmarkImageUri = await getBenchmarkImage(desiredBodyShape);
    const userImages = await processUserImages(imageUrls);


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: createUserContent([
        "Analyze these body images and provide detailed metrics. The first three images are the user's front, back, and side views. The last image is the benchmark. Provide scores out of 100. The benchmark image has a score of 95 for all attributes. Reject the image if the image doesn't feature a person, and provide a reason for the rejection.",
        ...userImages,
        createPartFromUri(benchmarkImageUri, "image/jpeg"),
      ]),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            imageRejected: { type: Type.BOOLEAN },
            imageRejectionReason: { type: Type.STRING },
            currentSnatchedScore: { type: Type.NUMBER },
            potentialSnatchedScore: { type: Type.NUMBER },
            potentialWaistReductionInches: { type: Type.NUMBER },
            glowUpOdds: { type: Type.NUMBER },
            transformationComplete: { type: Type.NUMBER },
            waistDefinition: { type: Type.NUMBER },
            hipCurve: { type: Type.NUMBER },
            gluteShape: { type: Type.NUMBER },
            posture: { type: Type.NUMBER },
            armShape: { type: Type.NUMBER },
            backDefinition: { type: Type.NUMBER }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const result = JSON.parse(response.text) as BodyRatingResponse;

    
    if (result.imageRejected) {
      return {
        imageRejected: true,
        imageRejectionReason: result.imageRejectionReason,
        currentSnatchedScore: null,
        potentialSnatchedScore: null,
        potentialWaistReductionInches: null,
        glowUpOdds: null,
        transformationComplete: null,
        waistDefinition: null,
        hipCurve: null,
        gluteShape: null,
        posture: null,
        armShape: null,
        backDefinition: null
      };
    }

    return result;
  } catch (error) {
    console.error("Error analyzing body images:", error);
    throw error;
  }
} 