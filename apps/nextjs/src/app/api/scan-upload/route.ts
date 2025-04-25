import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

type PhotoType = 'front' | 'side' | 'back';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const deviceId = formData.get('deviceId') as string;
    const photoType = formData.get('photoType') as PhotoType;
    
    if (!deviceId || !photoType) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing deviceId or photoType",
        },
        { status: 400 }
      );
    }

    const files: { key: string; presignedUrl: string }[] = [];

    // Process each file in the form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("photo.")) {
        const file = value as File;
        const fileExtension = file.name.split(".").pop() ?? "jpg";
        const fileName = `${uuidv4()}.${fileExtension}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Organize files by device ID and photo type
        const fileKey = `temp-users/${deviceId}/${photoType}/${fileName}`;

        // Upload to S3
        const putCommand = new PutObjectCommand({
          Bucket: "snatched-ai-bucket",
          Key: fileKey,
          Body: buffer,
          ContentType: file.type,
        });

        await s3Client.send(putCommand);

        // Get Command for generating presigned URL
        const getCommand = new GetObjectCommand({
          Bucket: "snatched-ai-bucket",
          Key: fileKey,
          ResponseContentType: file.type,
        });

        // Generate presigned URL for the uploaded file
        const presignedUrl = await getSignedUrl(s3Client, getCommand, { 
          expiresIn: 3600,
        });

        files.push({ 
          key: fileKey, 
          presignedUrl 
        });
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Files uploaded successfully",
        data: files
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to upload files",
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
