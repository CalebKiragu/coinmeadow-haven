
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Minus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EarnWithdrawProps {
  walletAddress?: string;
  walletProvider?: any;
  asset: {
    symbol: string;
    name: string;
    stakedBalance: string;
    apy: string;
    decimals: number;
  };
  onWithdraw: (amount: string, asset: string) => Promise<void>;
  isProcessing: boolean;
}

const EarnWithdraw: React.FC<EarnWithdrawProps> = ({ 
  walletAddress,
  walletProvider,
  asset,
  onWithdraw,
  isProcessing
}) => {
  const { toast } = useToast();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Helper function to set max amount
  const handleMax = () => {
    setWithdrawAmount(asset.stakedBalance);
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawAmount(e.target.value);
  };

  // Handle withdraw action
  const handleEarnWithdraw = async () => {
    if (!walletAddress || !walletProvider) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive"
      });
      return;
    }

    try {
      await onWithdraw(withdrawAmount, asset.symbol);
    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  // Calculate what amounts look like
  const halfAmount = (parseFloat(asset.stakedBalance) / 2).toString();
  const quarterAmount = (parseFloat(asset.stakedBalance) / 4).toString();
  
  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center">
              Withdraw {asset.symbol}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Withdraw your staked {asset.symbol}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Currently earning {asset.apy} APY</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{asset.stakedBalance} {asset.symbol}</p>
            <p className="text-xs text-muted-foreground">Staked</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="0.0"
            className="pr-16"
            value={withdrawAmount}
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
            onClick={() => setWithdrawAmount(quarterAmount)}
          >
            25%
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setWithdrawAmount(halfAmount)}
          >
            50%
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setWithdrawAmount(asset.stakedBalance)}
          >
            100%
          </Button>
        </div>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={handleEarnWithdraw}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Withdrawing...</>
          ) : (
            <><Minus className="h-4 w-4 mr-2" /> Withdraw</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EarnWithdraw;
