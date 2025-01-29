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

  const handleQrScan = () => {
    toast({
      title: "QR Scanner",
      description: "QR scanning feature coming soon!",
    });
  };

  const handleNext = () => {
    if (merchantNumber.length !== 6) {
      toast({
        title: "Invalid Merchant Number",
        description: "Please enter a valid 6-digit merchant number",
        variant: "destructive",
      });
      return;
    }
    onDataChange({ merchantNumber });
    onNextStep();
  };

  return (
    <div className="space-y-4 animate-fade-in">
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
      <Button className="w-full" onClick={handleNext}>
        Next
      </Button>
    </div>
  );
};