
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import OTPInput from "./OTPInput";
import { StepIndicator } from "../send/StepIndicator";

type ChangePinFormProps = {
  isReset?: boolean;
  onClose?: () => void;
};

const ChangePinForm = ({ isReset = false, onClose }: ChangePinFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    oldPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (currentStep === 1) {
        // Verify OTP
        if (otp.length !== 4) {
          throw new Error("Please enter a valid 4-digit OTP");
        }
        // Simulate OTP verification
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Validate PINs
        if (!isReset && formData.oldPin.length !== 4) {
          throw new Error("Please enter your current PIN");
        }
        if (formData.newPin.length !== 4) {
          throw new Error("Please enter a valid 4-digit PIN");
        }
        if (formData.newPin !== formData.confirmPin) {
          throw new Error("PINs do not match");
        }
        // Simulate PIN change
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCurrentStep(3);
        toast({
          title: "Success!",
          description: `PIN successfully ${isReset ? "reset" : "changed"}`,
        });
        setTimeout(() => {
          onClose?.();
        }, 2000);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <StepIndicator
        steps={3}
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep) setCurrentStep(step);
        }}
      />

      <form onSubmit={handleStepSubmit} className="space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              {isReset ? "Reset PIN Verification" : "Change PIN Verification"}
            </h2>
            <OTPInput
              value={otp}
              onChange={handleOtpChange}
              identifier="your email/phone"
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              {isReset ? "Set New PIN" : "Change PIN"}
            </h2>
            {!isReset && (
              <div className="space-y-2">
                <Input
                  type="password"
                  name="oldPin"
                  placeholder="Current PIN"
                  value={formData.oldPin}
                  onChange={handleInputChange}
                  maxLength={4}
                  className="text-center"
                />
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="password"
                name="newPin"
                placeholder="New PIN"
                value={formData.newPin}
                onChange={handleInputChange}
                maxLength={4}
                className="text-center"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                name="confirmPin"
                placeholder="Confirm New PIN"
                value={formData.confirmPin}
                onChange={handleInputChange}
                maxLength={4}
                className="text-center"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">
              {isReset ? "PIN Reset Complete" : "PIN Change Complete"}
            </h2>
            <p className="text-muted-foreground">
              Your PIN has been successfully {isReset ? "reset" : "changed"}. You
              can now use your new PIN to access your wallet.
            </p>
          </div>
        )}

        {currentStep < 3 && (
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Continue"}
          </Button>
        )}
      </form>
    </div>
  );
};

export default ChangePinForm;
