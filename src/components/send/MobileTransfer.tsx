
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSendPay } from "@/contexts/SendPayContext";
import RecipientInput from "./mobile/RecipientInput";
import AmountInput from "./mobile/AmountInput";
import PinInput from "./mobile/PinInput";

export const MobileTransfer = ({
  currentStep,
}: {
  currentStep: number;
}) => {
  const { 
    mobileNumber, 
    setMobileNumber,
    mobileInputType,
    setMobileInputType,
    selectedCountryCode,
    setSelectedCountryCode,
    setBlockchainMode
  } = useSendPay();

  const handleBlockchainMode = () => {
    setBlockchainMode(true);
  };

  if (currentStep === 1) {
    return (
      <div className="space-y-4 animate-fade-in">
        <RecipientInput
          mobileNumber={mobileNumber}
          setMobileNumber={setMobileNumber}
          mobileInputType={mobileInputType}
          setMobileInputType={setMobileInputType}
          selectedCountryCode={selectedCountryCode}
          setSelectedCountryCode={setSelectedCountryCode}
        />
        
        <Button 
          variant="outline"
          className="w-full mt-4"
          onClick={handleBlockchainMode}
        >
          Send to Blockchain Address <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  if (currentStep === 2) {
    return (
      <div className="space-y-4 animate-fade-in">
        <AmountInput />
      </div>
    );
  }
  
  if (currentStep === 3) {
    return (
      <div className="space-y-4 animate-fade-in">
        <PinInput />
      </div>
    );
  }

  return null;
};
