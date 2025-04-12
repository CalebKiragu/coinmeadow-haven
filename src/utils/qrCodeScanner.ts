
import QrScanner from 'qr-scanner';

/**
 * Processes an image file and attempts to extract QR code data from it
 * @param file The image file to process
 * @returns A promise that resolves to the decoded QR code string or null if no QR code was found
 */
export const processQRCodeFromFile = async (file: File): Promise<string | null> => {
  try {
    console.log("Processing image file for QR code...");
    
    // Use QR Scanner library to scan the image file
    const result = await QrScanner.scanImage(file, {
      returnDetailedScanResult: true,
    });
    
    if (result && result.data) {
      console.log("QR code found:", result.data);
      return result.data;
    } else {
      console.log("No QR code detected in the image");
      return null;
    }
  } catch (error) {
    console.error("Error processing QR code from file:", error);
    return null;
  }
};
