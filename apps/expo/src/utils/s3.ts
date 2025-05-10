/**
 * Upload a file to S3 using a presigned URL
 * @param uri - The local file URI
 * @param presignedUrl - The S3 presigned URL
 * @returns Promise<boolean> - true if upload succeeded, false otherwise
 */
export const uploadToS3 = async (uri: string, presignedUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': blob.type,
      },
    });
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return false;
  }
}; 