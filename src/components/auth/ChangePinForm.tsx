import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import OTPInput from "./OTPInput";
import ResendOTP from "./ResendOTP";
import { StepIndicator } from "../send/StepIndicator";
import { ApiService } from "@/lib/services";
import { useAppSelector } from "@/lib/redux/hooks";

type ChangePinFormProps = {
  isReset?: boolean;
  isMerchant?: boolean;
  onClose?: () => void;
};

const ChangePinForm = ({
  isReset = false,
  isMerchant = false,
  onClose,
}: ChangePinFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmOtp, setConfirmOtp] = useState("");
  const [recipient, setRecipient] = useState("");
  const [formData, setFormData] = useState({
    oldPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { error, otp } = useAppSelector((state) => state.auth);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "recipient") {
      setRecipient(value);
    } else if (value.length <= 4 && /^\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);

    try {
      // Choose the appropriate resend method based on recipient type and user/merchant status

      if (isReset && isMerchant)
        await ApiService.resetMerchantPin({
          ...(isEmail ? { email: recipient } : { phone: recipient }),
        });

      if (isReset && !isMerchant)
        await ApiService.resetUserPin({
          ...(isEmail ? { email: recipient } : { phone: recipient }),
        });

      toast({
        title: "OTP Sent",
        description: `New verification code sent to ${recipient}`,
      });

      // Reset OTP field
      setConfirmOtp("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to resend OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);
    const isPhone = /^(0\d{9}|254\d{9})$/.test(recipient);

    try {
      if (currentStep === 1) {
        // Validate recipient
        if (!recipient) {
          throw new Error("Please enter your email or phone number");
        }

        if (!isEmail && !isPhone) {
          throw new Error(
            "Please enter a valid email or phone number (without country code)"
          );
        }
        // if reset, Request OTP to proceed
        // if change, proceed to enter credentials
        if (isReset && !isMerchant)
          await ApiService.resetUserPin({
            ...(isEmail ? { email: recipient } : { phone: recipient }),
          });
        if (isReset && isMerchant)
          await ApiService.resetMerchantPin({
            ...(isEmail ? { email: recipient } : { phone: recipient }),
          });

        if (isReset) {
          setCurrentStep(2);
        } else {
          setCurrentStep(3);
        }
      } else if (currentStep === 2) {
        // Verify OTP provided
        if (confirmOtp.length !== 4) {
          throw new Error("Please enter a valid 4-digit OTP");
        }
        setCurrentStep(3);
      } else if (currentStep === 3) {
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
        // Verify provided PIN and OTP to change/reset PIN
        if (isReset && !isMerchant)
          await ApiService.resetUserPin({
            ...(isEmail ? { email: recipient } : { phone: recipient }),
            otpId: otp?.otpId,
            otp: confirmOtp,
            newPin: formData.confirmPin,
          });
        if (isReset && isMerchant)
          await ApiService.resetMerchantPin({
            ...(isEmail ? { email: recipient } : { phone: recipient }),
            otpId: otp?.otpId,
            otp: confirmOtp,
            newPin: formData.confirmPin,
          });

        if (!isReset && !isMerchant)
          await ApiService.changeUserPin({
            ...(isEmail ? { email: recipient } : { phone: recipient }),
            oldPin: formData.oldPin,
            newPin: formData.confirmPin,
          });
        if (!isReset && isMerchant)
          await ApiService.changeMerchantPin({
            ...(isEmail ? { email: recipient } : { phone: recipient }),
            oldPin: formData.oldPin,
            newPin: formData.confirmPin,
          });

        setCurrentStep(4);
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
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <StepIndicator
        steps={4}
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
            <div className="space-y-2">
              <Input
                type="text"
                name="recipient"
                placeholder="Enter your email or phone"
                value={recipient}
                onChange={handleInputChange}
                className="text-center"
              />
              <p className="text-sm text-muted-foreground text-center">
                Enter your email or phone number to receive a verification code
              </p>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Verify OTP</h2>
            <OTPInput
              value={confirmOtp}
              onChange={setConfirmOtp}
              identifier={recipient}
            />
            <ResendOTP onResend={handleResendOTP} />
          </div>
        )}

        {currentStep === 3 && (
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

        {currentStep === 4 && (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">
              {isReset ? "PIN Reset Complete" : "PIN Change Complete"}
            </h2>
            <p className="text-muted-foreground">
              Your PIN has been successfully {isReset ? "reset" : "changed"}.
              You can now use your new PIN to access your wallet.
            </p>
          </div>
        )}

        {currentStep < 4 && (
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Continue"}
          </Button>
        )}
      </form>
    </div>
  );
};

export default ChangePinForm;
