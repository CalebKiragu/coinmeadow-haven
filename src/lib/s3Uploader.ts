import { getEnvironmentConfig } from "./utils";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

interface UploadResult {
  success: boolean;
  url: string;
  error?: string;
}

const AWS = getEnvironmentConfig().aws;

/**
 * Uploads a file to AWS S3 using a presigned URL
 * @param file The file to upload
 * @param fileName The name to use when storing in S3
 * @returns Promise with the result of the operation
 */
export const uploadToS3 = async (
  file: File,
  fileName: string
): Promise<UploadResult> => {
  try {
    // Initialize S3 Client
    const s3 = new S3Client({
      region: AWS.s3.REGION,
      credentials: fromCognitoIdentityPool({
        clientConfig: { region: AWS.s3.REGION },
        identityPoolId: AWS.s3.IDENTITY_POOL_ID,
      }),
    });

    // Convert File to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer); // Ensure compatibility

    const params = {
      Bucket: "pesatoken-kyc",
      Key: `uploads/${fileName}`, // Path in S3 bucket
      Body: uint8Array,
      ContentType: file.type || "image/jpeg", // Set the correct content type
    };

    await s3.send(new PutObjectCommand(params));
    return {
      success: true,
      url: `https://${AWS.s3.BUCKET_NAME}.s3.${AWS.s3.REGION}.amazonaws.com/uploads/${fileName}`,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return {
      success: false,
      url: "",
      error: "Failed to upload file to storage",
    };
  }
};

/**
 * Generate a filename for KYC documents following the naming convention
 * (firstname-identifier-imagetype.jpeg)
 */
export const generateKycFilename = (
  firstName: string,
  fileName: string,
  identifier: string, // userId or merchantId
  imageType: "selfie" | "front" | "back"
): string => {
  // Sanitize inputs to make them safe for filenames
  const sanitizedName = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const sanitizedFileName = fileName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const sanitizedIdentifier = identifier
    .toLowerCase()
    .replace(/[^a-z0-9@.]/g, "")
    .replace(/@/g, "-at-")
    .replace(/\./g, "-dot-");

  return `${sanitizedName}-${sanitizedIdentifier}-${sanitizedFileName}-${imageType}.jpeg`;
};
