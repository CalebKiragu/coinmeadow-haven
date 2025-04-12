
import React, { useState, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, FileUp, X } from "lucide-react";
import { processQRCodeFromFile } from '@/utils/qrCodeScanner';
import { useToast } from '@/hooks/use-toast';
import { isMobile } from '@/utils/deviceDetection';

// Define the interface for detected barcodes based on the library's types
interface IDetectedBarcode {
  rawValue: string;
  format?: string;
  // Add other properties that might be in the IDetectedBarcode type
}

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  
  // Modified to accept an array of detected barcodes
  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    // Process the first detected code if available
    if (detectedCodes && detectedCodes.length > 0 && detectedCodes[0].rawValue) {
      const data = detectedCodes[0].rawValue;
      onScan(data);
      onClose();
      toast({
        title: "QR Code Scanned",
        description: "Address successfully extracted from QR code",
      });
    }
  };

  const handleError = (err: any) => {
    console.error("QR Scanner error:", err);
    toast({
      title: "Scanning Error",
      description: "There was an error scanning the QR code. Please try again.",
      variant: "destructive",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    try {
      setIsScanning(true);
      const result = await processQRCodeFromFile(file);
      setIsScanning(false);
      
      if (result) {
        onScan(result);
        onClose();
        toast({
          title: "QR Code Processed",
          description: "Address successfully extracted from image",
        });
      } else {
        toast({
          title: "No QR Code Found",
          description: "Could not find a valid QR code in the image",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsScanning(false);
      console.error("Error processing file:", error);
      toast({
        title: "Processing Error",
        description: "Could not process the image. Please try a different file.",
        variant: "destructive",
      });
    }
  };

  // Determine the best camera facing mode based on device
  const getFacingMode = () => {
    // For mobile devices, prefer the back camera
    if (isMobile()) {
      return "environment"; // This selects the back camera on mobile devices
    }
    // For desktop, use whatever camera is available (typically front camera)
    return "user";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex justify-center space-x-2 mb-4">
          <Button
            variant={scanMode === 'camera' ? "default" : "outline"}
            onClick={() => setScanMode('camera')}
            className="flex items-center gap-2"
          >
            <Camera size={16} />
            Camera
          </Button>
          <Button
            variant={scanMode === 'upload' ? "default" : "outline"}
            onClick={() => setScanMode('upload')}
            className="flex items-center gap-2"
          >
            <FileUp size={16} />
            Upload
          </Button>
        </div>

        {scanMode === 'camera' ? (
          <div className="w-full aspect-square max-h-[300px] overflow-hidden rounded-md">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              scanDelay={500}
              constraints={{
                facingMode: getFacingMode()
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-8">
            <FileUp className="h-12 w-12 text-gray-400 mb-4" />
            <p className="mb-4 text-center text-sm text-gray-500">
              Upload an image containing a QR code
            </p>
            {isScanning ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                <p>Scanning image...</p>
              </div>
            ) : (
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose Image
              </Button>
            )}
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isScanning}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
