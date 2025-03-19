
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const MerchantPayment = ({
  onNextStep,
  currentStep,
  savedData,
  onDataChange,
}: {
  onNextStep: () => void;
  currentStep: number;
  savedData: any;
  onDataChange: (data: any) => void;
}) => {
  const { toast } = useToast();
  const [merchantNumber, setMerchantNumber] = useState(
    savedData?.merchantNumber || ""
  );
  const [amount, setAmount] = useState(savedData?.amount || "");
  const [pin, setPin] = useState(savedData?.pin || "");

  const handleQrScan = () => {
    toast({
      title: "QR Scanner",
      description: "QR scanning feature coming soon!",
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (merchantNumber.length !== 6) {
        toast({
          title: "Invalid Merchant Number",
          description: "Please enter a valid 6-digit merchant number",
          variant: "destructive",
        });
        return;
      }
      onDataChange({ merchantNumber });
    } else if (currentStep === 2) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }
      onDataChange({ amount });
    } else if (currentStep === 3) {
      if (!pin || pin.length < 4) {
        toast({
          title: "Invalid PIN",
          description: "Please enter your PIN",
          variant: "destructive",
        });
        return;
      }
      onDataChange({ pin });
    }
    
    onNextStep();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {currentStep === 1 && (
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter 6-digit merchant number"
            value={merchantNumber}
            onChange={(e) => setMerchantNumber(e.target.value)}
            maxLength={6}
            className="pr-20"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={handleQrScan}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {currentStep === 2 && (
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      )}
      
      {currentStep === 3 && (
        <Input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
      )}
      
      <Button className="w-full" onClick={handleNext}>
        Next
      </Button>
    </div>
  );
};
