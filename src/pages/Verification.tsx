import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import VerificationForm from "@/components/verification/VerificationForm";
import VerificationPreview from "@/components/verification/VerificationPreview";
import VerificationStatus from "@/components/verification/VerificationStatus";
import { toast } from "sonner";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { ApiService } from "@/lib/services";

export type VerificationStep = "form" | "preview" | "status";

const Verification = () => {
  const [currentStep, setCurrentStep] = useState<VerificationStep>("form");
  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = (data: any) => {
    setFormData(data);
    setCurrentStep("preview");
  };

  const handlePreviewSubmit = async () => {
    try {
      // Submit verification to API
      setIsSubmitting(true);
      await ApiService.submitKycVerification(formData);
      toast.success("Verification submitted successfully!");
      setCurrentStep("status");
    } catch (error) {
      toast.error(`Failed to submit verification. ${error}`);
      console.error("Verification submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSupport = () => {
    window.open("https://wa.me/+254713278107", "_blank");
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-gradient-to-br from-purple-800 via-fuchsia-500 to-pink-400 dark:from-purple-900 dark:via-gray-900 dark:to-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <NavigationHeader title="Account Verification" />

        <div className="flex justify-between items-center">
          <h1 className="text-base font-bold text-white">
            Provide your details to continue
          </h1>
          <Button
            variant="outline"
            onClick={handleContactSupport}
            className="flex items-center gap-2"
          >
            <Headset className="h-4 w-4" />
            Contact Support
          </Button>
        </div>

        <div className="glass-effect p-4 rounded-lg animate-fade-in">
          {currentStep === "form" && (
            <VerificationForm onSubmit={handleFormSubmit} />
          )}
          {currentStep === "preview" && (
            <VerificationPreview
              data={formData}
              onEdit={() => setCurrentStep("form")}
              onSubmit={handlePreviewSubmit}
              isSubmitting={isSubmitting}
            />
          )}
          {currentStep === "status" && <VerificationStatus />}
        </div>

        <p className="text-xs text-white/60 text-center">
          Security Advisory: All information provided during verification is
          encrypted and stored securely. By proceeding with verification, you
          consent to our verification process and data handling practices. Your
          information may be shared with relevant authorities for verification
          purposes.
        </p>
      </div>
    </div>
  );
};

export default Verification;
