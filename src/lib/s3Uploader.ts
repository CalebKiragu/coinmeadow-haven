
import axios from "axios";
import { url } from "./utils";

interface UploadResult {
  success: boolean;
  url: string;
  error?: string;
}

/**
 * Uploads a file to AWS S3 using a presigned URL
 * @param file The file to upload
 * @param fileName The name to use when storing in S3
 * @returns Promise with the result of the operation
 */
export const uploadToS3 = async (file: File, fileName: string): Promise<UploadResult> => {
  try {
    // Request a presigned URL from the backend
    const { BASE_URL } = url();
    const presignedUrlResponse = await axios.get(
      `${BASE_URL}/v1/s3/presigned?key=pesatoken-kyc/verif/${fileName}`
    );
    
    const { presignedUrl, publicUrl } = presignedUrlResponse.data;
    
    // Upload the file directly to S3 using the presigned URL
    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
        "x-amz-acl": "public-read",
      },
    });
    
    return {
      success: true,
      url: publicUrl,
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
  identifier: string, // phone or email
  imageType: "selfie" | "front" | "back"
): string => {
  // Sanitize inputs to make them safe for filenames
  const sanitizedName = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const sanitizedIdentifier = identifier
    .toLowerCase()
    .replace(/[^a-z0-9@.]/g, "")
    .replace(/@/g, "-at-")
    .replace(/\./g, "-dot-");
  
  return `${sanitizedName}-${sanitizedIdentifier}-${imageType}.jpeg`;
};
