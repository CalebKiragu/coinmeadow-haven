
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSendPay } from "@/contexts/SendPayContext";

export const MerchantPayment = ({
  currentStep,
}: {
  currentStep: number;
}) => {
  const { toast } = useToast();
  const { 
    merchantNumber, 
    setMerchantNumber,
    merchantAmount,
    setMerchantAmount,
    merchantPin,
    setMerchantPin
  } = useSendPay();

  const handleQrScan = () => {
    toast({
      title: "QR Scanner",
      description: "QR scanning feature coming soon!",
    });
  };

  if (currentStep === 1) {
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
            required
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
      </div>
    );
  }
  
  if (currentStep === 2) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Input
          type="number"
          placeholder="Enter amount"
          value={merchantAmount}
          onChange={(e) => setMerchantAmount(e.target.value)}
          required
        />
      </div>
    );
  }
  
  if (currentStep === 3) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Input
          type="password"
          placeholder="Enter PIN"
          value={merchantPin}
          onChange={(e) => setMerchantPin(e.target.value)}
          required
        />
      </div>
    );
  }

  return null;
};
