
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EarnDepositProps {
  walletAddress?: string;
  walletProvider?: any;
  asset: {
    symbol: string;
    name: string;
    balance: string;
    apy: string;
    decimals: number;
  };
  onDeposit: (amount: string, asset: string) => Promise<void>;
  isProcessing: boolean;
}

const EarnDeposit: React.FC<EarnDepositProps> = ({ 
  walletAddress,
  walletProvider,
  asset,
  onDeposit,
  isProcessing
}) => {
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState("");

  // Helper function to set max amount
  const handleMax = () => {
    setDepositAmount(asset.balance);
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepositAmount(e.target.value);
  };

  // Handle stake action
  const handleEarnDeposit = async () => {
    if (!walletAddress || !walletProvider) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive"
      });
      return;
    }

    try {
      await onDeposit(depositAmount, asset.symbol);
    } catch (error) {
      console.error("Deposit error:", error);
    }
  };

  // Calculate what amounts look like
  const halfAmount = (parseFloat(asset.balance) / 2).toString();
  const quarterAmount = (parseFloat(asset.balance) / 4).toString();
  
  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center">
              Deposit {asset.symbol}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Earn {asset.apy} on your {asset.symbol} deposits</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Earn {asset.apy} APY</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{asset.balance} {asset.symbol}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="0.0"
            className="pr-16"
            value={depositAmount}
            onChange={handleAmountChange}
          />
          <Button 
            variant="secondary"
            size="sm"
            className="absolute right-1 top-1"
            onClick={handleMax}
          >
            MAX
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setDepositAmount(quarterAmount)}
          >
            25%
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setDepositAmount(halfAmount)}
          >
            50%
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setDepositAmount(asset.balance)}
          >
            100%
          </Button>
        </div>
        
        <Button
          className="w-full bg-green-800 hover:bg-green-700"
          onClick={handleEarnDeposit}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Depositing...</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" /> Deposit</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EarnDeposit;
