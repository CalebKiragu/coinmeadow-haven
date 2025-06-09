import { useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadToS3, generateKycFilename } from "@/lib/s3Uploader";
import { useAppSelector } from "@/lib/redux/hooks";

interface VerificationFormProps {
  onSubmit: (data: any) => void;
}

const VerificationForm = ({ onSubmit }: VerificationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, merchant } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    idNumber: "",
    selfie: null as File | null,
    idFront: null as File | null,
    idBack: null as File | null,
  });

  const handleFileUpload =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFormData((prev) => ({ ...prev, [field]: file }));
        toast.success(`${field} selected successfully`);
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selfie || !formData.idFront || !formData.idBack) {
      toast.error("Please select all required documents");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get user identifier (userId or merchantId)
      const identifier = user?.userId || merchant?.merchantId || "";

      // Upload files to S3
      const selfieFilename = generateKycFilename(
        formData.firstName,
        formData.selfie.name,
        identifier,
        `selfie`
      );
      const idFrontFilename = generateKycFilename(
        formData.firstName,
        formData.idFront.name,
        identifier,
        `front`
      );
      const idBackFilename = generateKycFilename(
        formData.firstName,
        formData.idBack.name,
        identifier,
        `back`
      );

      // Upload all files in parallel
      const [selfieUpload, idFrontUpload, idBackUpload] = await Promise.all([
        uploadToS3(formData.selfie, selfieFilename),
        uploadToS3(formData.idFront, idFrontFilename),
        uploadToS3(formData.idBack, idBackFilename),
      ]);

      // Check if all uploads were successful
      if (
        !selfieUpload.success ||
        !idFrontUpload.success ||
        !idBackUpload.success
      ) {
        throw new Error("Failed to upload one or more files");
      }

      console.log("====================================");
      console.log(user, merchant);
      console.log("====================================");
      // Prepare verification submission data
      const verificationData = {
        firstName: formData.firstName,
        lastName: formData.surname,
        govId: formData.idNumber,
        email: user?.email || merchant?.email,
        phone: user?.phone || merchant?.phone,
        selfie: selfieUpload.url,
        idFront: idFrontUpload.url,
        idBack: idBackUpload.url,
        location: ["0.0", "0.0"], // Default location if geolocation is not available
        isMerchant: !!merchant,
      };

      console.log("verification data >> ", verificationData);

      // Try to get user's geolocation
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
              });
            }
          );

          verificationData.location = [
            position.coords.longitude.toString(),
            position.coords.latitude.toString(),
          ];
        } catch (error) {
          console.warn("Could not get geolocation:", error);
          // Continue with default location
        }
      }
      toast.success("images uploaded successfully!");
      onSubmit(verificationData);
    } catch (error) {
      toast.error(`Failed to upload images. ${error}`);
      console.error("Image upload error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Official First Name</Label>
          <Input
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surname">Official Surname</Label>
          <Input
            id="surname"
            required
            value={formData.surname}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, surname: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="idNumber">National ID/Passport Number</Label>
        <Input
          id="idNumber"
          required
          value={formData.idNumber}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, idNumber: e.target.value }))
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="space-y-2">
          <Label>Selfie</Label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload("selfie")}
              className="hidden"
              id="selfie"
            />
            <Label
              htmlFor="selfie"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
            >
              <Camera className="w-8 h-8 mb-2" />
              <span className="text-sm">Upload Selfie</span>
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>ID/Passport Front</Label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload("idFront")}
              className="hidden"
              id="idFront"
            />
            <Label
              htmlFor="idFront"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm">Front Side</span>
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>ID/Passport Back</Label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload("idBack")}
              className="hidden"
              id="idBack"
            />
            <Label
              htmlFor="idBack"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm">Back Side</span>
            </Label>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Uploading..." : "Continue to Preview"}
      </Button>
    </form>
  );
};

export default VerificationForm;
