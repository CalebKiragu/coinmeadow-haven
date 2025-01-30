import { useState } from "react";
import { Camera, Upload } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface VerificationFormProps {
  onSubmit: (data: any) => void;
}

const VerificationForm = ({ onSubmit }: VerificationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    idNumber: "",
    selfie: null as File | null,
    idFront: null as File | null,
    idBack: null as File | null,
  });

  const handleFileUpload = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
      toast.success(`${field} uploaded successfully`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selfie || !formData.idFront || !formData.idBack) {
      toast.error("Please upload all required documents");
      return;
    }

    setIsSubmitting(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });

    try {
      // Replace with your actual API endpoint
      const response = await axios.post('/api/verification', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success("Verification submitted successfully");
      onSubmit(response.data);
    } catch (error) {
      toast.error("Failed to submit verification");
      console.error('Verification submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Official First Name</Label>
          <Input
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surname">Official Surname</Label>
          <Input
            id="surname"
            required
            value={formData.surname}
            onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="idNumber">National ID/Passport Number</Label>
        <Input
          id="idNumber"
          required
          value={formData.idNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        {isSubmitting ? "Submitting..." : "Continue to Preview"}
      </Button>
    </form>
  );
};

export default VerificationForm;