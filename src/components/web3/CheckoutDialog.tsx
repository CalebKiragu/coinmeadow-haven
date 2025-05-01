
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ApiService } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckoutComplete: () => void;
}

const supportedTokens = [
  { name: "USDC", value: "USDC", recommended: true },
  { name: "ETH", value: "ETH", recommended: false },
  { name: "DAI", value: "DAI", recommended: false },
  { name: "WBTC", value: "WBTC", recommended: false },
];

const CheckoutDialog = ({
  open,
  onOpenChange,
  onCheckoutComplete,
}: CheckoutDialogProps) => {
  const [amount, setAmount] = useState<string>("1");
  const [currency, setCurrency] = useState<string>("USDC");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const chargeData = {
        amount: amount,
        currency: currency,
        orderId: crypto.randomUUID(),
        type: "fixed_price",
      };
      
      await ApiService.createCharge(chargeData);
      onCheckoutComplete();
      
      toast({
        title: "Checkout initiated",
        description: "Please complete the checkout process",
      });
    } catch (error) {
      console.error("Error creating charge:", error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fund Your Wallet</DialogTitle>
          <DialogDescription>
            Enter the amount and select a token to fund your wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="amount" className="text-right col-span-1">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="1.0"
              min="0.01"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="currency" className="text-right col-span-1">
              Token
            </label>
            <Select
              value={currency}
              onValueChange={setCurrency}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {supportedTokens.map((token) => (
                  <SelectItem key={token.value} value={token.value}>
                    {token.name} {token.recommended && "(Recommended)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Alert variant="default" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              USDC is recommended for lower fees. Other tokens may incur higher gas fees.
              Price and availability subject to network conditions.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCheckout} disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
