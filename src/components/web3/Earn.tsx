
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { StakingService } from "@/lib/services/stakingService";
import { Loader2 } from "lucide-react";

interface EarnProps {
  walletAddress?: string;
  walletProvider?: any;
  stakingAssets: Array<{
    symbol: string;
    name: string;
    balance: string;
    apy: string;
    decimals: number;
  }>;
  onRefresh?: () => void;
}

const Earn = ({ walletAddress, walletProvider, stakingAssets, onRefresh }: EarnProps) => {
  const { toast } = useToast();
  const [stakeAmount, setStakeAmount] = useState<Record<string, string>>({});
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  // Helper function to set max amount
  const handleStakeMax = (symbol: string) => {
    const asset = stakingAssets.find(a => a.symbol === symbol);
    if (asset) {
      setStakeAmount({
        ...stakeAmount,
        [symbol]: asset.balance
      });
    }
  };

  // Handle amount change
  const handleStakeAmountChange = (symbol: string, amount: string) => {
    setStakeAmount({
      ...stakeAmount,
      [symbol]: amount
    });
  };

  // Handle stake action
  const handleStake = async (asset: typeof stakingAssets[0]) => {
    if (!walletAddress || !walletProvider) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    const amount = stakeAmount[asset.symbol];
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to stake",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsStaking(true);
      setSelectedAsset(asset.symbol);
      
      // Get a signer for the transaction
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      
      // Execute the staking transaction
      const tx = await StakingService.stakeTokens(signer, amount, asset.decimals);
      
      toast({
        title: "Staking Transaction Sent",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-4)}`,
      });
      
      // Wait for transaction confirmation
      await tx.wait();
      
      toast({
        title: "Staking Successful",
        description: `Successfully staked ${amount} ${asset.symbol}`,
      });
      
      // Refresh staking assets if callback provided
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error("Staking error:", error);
      toast({
        title: "Staking Failed",
        description: `Error: ${(error as Error).message || "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
      setSelectedAsset(null);
    }
  };

  // Handle unstake action
  const handleUnstake = async (asset: typeof stakingAssets[0]) => {
    if (!walletAddress || !walletProvider) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    const amount = stakeAmount[asset.symbol];
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to unstake",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUnstaking(true);
      setSelectedAsset(asset.symbol);
      
      // Get a signer for the transaction
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      
      // Execute the unstaking transaction
      const tx = await StakingService.unstakeTokens(signer, amount, asset.decimals);
      
      toast({
        title: "Unstaking Transaction Sent",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-4)}`,
      });
      
      // Wait for transaction confirmation
      await tx.wait();
      
      toast({
        title: "Unstaking Successful",
        description: `Successfully unstaked ${amount} ${asset.symbol}`,
      });
      
      // Refresh staking assets if callback provided
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error("Unstaking error:", error);
      toast({
        title: "Unstaking Failed",
        description: `Error: ${(error as Error).message || "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsUnstaking(false);
      setSelectedAsset(null);
    }
  };

  if (stakingAssets.length === 0) {
    return (
      <div className="text-center p-8">
        <p>No stakable assets found in your wallet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {stakingAssets.map((asset) => (
        <Card key={asset.symbol} className="p-4 border rounded-lg">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium">{asset.name} ({asset.symbol})</h3>
              <p className="text-sm text-muted-foreground">APY: {asset.apy}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{asset.balance} {asset.symbol}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex gap-2 mb-2">
              <Input
                type="number"
                placeholder="Amount"
                className="flex-1"
                min="0"
                max={asset.balance}
                value={stakeAmount[asset.symbol] || ''}
                onChange={(e) => handleStakeAmountChange(asset.symbol, e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={() => handleStakeMax(asset.symbol)}>Max</Button>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => handleStake(asset)}
                disabled={isStaking && selectedAsset === asset.symbol}
              >
                {isStaking && selectedAsset === asset.symbol ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Staking...</>
                ) : (
                  `Stake ${asset.symbol}`
                )}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleUnstake(asset)}
                disabled={isUnstaking && selectedAsset === asset.symbol}
              >
                {isUnstaking && selectedAsset === asset.symbol ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Unstaking...</>
                ) : (
                  `Unstake ${asset.symbol}`
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Earn;
