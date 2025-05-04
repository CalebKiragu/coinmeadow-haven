
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { StakingService } from "@/lib/services/stakingService";
import { Loader2, ArrowRight } from "lucide-react";
import EarnDeposit from "./EarnDeposit";
import EarnWithdraw from "./EarnWithdraw";

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

interface ExtendedAsset {
  symbol: string;
  name: string;
  balance: string;
  apy: string;
  decimals: number;
  stakedBalance: string;
}

const Earn = ({ walletAddress, walletProvider, stakingAssets, onRefresh }: EarnProps) => {
  const { toast } = useToast();
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [extendedAssets, setExtendedAssets] = useState<ExtendedAsset[]>([]);
  
  // Initialize extended assets with staked balances
  useEffect(() => {
    // Function to get staked balances
    const getStakedBalances = async () => {
      if (!walletAddress || !walletProvider) return;
      
      try {
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const extended = await Promise.all(stakingAssets.map(async (asset) => {
          try {
            // Get staking info for this asset
            const stakingInfo = await StakingService.getStakingInfo(provider, walletAddress);
            
            return {
              ...asset,
              stakedBalance: stakingInfo.vaultBalance || "0"
            };
          } catch (error) {
            console.error(`Error getting staked balance for ${asset.symbol}:`, error);
            return {
              ...asset,
              stakedBalance: "0"
            };
          }
        }));
        
        setExtendedAssets(extended);
      } catch (error) {
        console.error("Error getting staked balances:", error);
        // Fall back to mock staked balances
        const mockExtended = stakingAssets.map(asset => ({
          ...asset,
          stakedBalance: "0"
        }));
        setExtendedAssets(mockExtended);
      }
    };
    
    // If we don't have real data, use mock data
    if (!walletAddress || !walletProvider || stakingAssets.length === 0) {
      const mockAssets = StakingService.getMockStakingAssets().map(asset => ({
        ...asset,
        stakedBalance: (parseFloat(asset.balance) * 0.5).toString() // 50% of balance is staked in mock data
      }));
      setExtendedAssets(mockAssets);
    } else {
      getStakedBalances();
    }
  }, [walletAddress, walletProvider, stakingAssets]);

  // Handle deposit action
  const handleDeposit = async (amount: string, assetSymbol: string) => {
    if (!walletAddress || !walletProvider) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDepositing(true);
      setSelectedAsset(assetSymbol);
      
      // Find the asset
      const asset = stakingAssets.find(a => a.symbol === assetSymbol);
      if (!asset) throw new Error("Asset not found");
      
      // Get a signer for the transaction
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      
      // Execute the staking transaction
      const tx = await StakingService.stakeTokens(signer, amount, asset.decimals);
      
      toast({
        title: "Deposit Transaction Sent",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-4)}`,
      });
      
      // Wait for transaction confirmation
      await tx.wait();
      
      toast({
        title: "Deposit Successful",
        description: `Successfully deposited ${amount} ${asset.symbol}`,
      });
      
      // Refresh staking assets if callback provided
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit Failed",
        description: `Error: ${(error as Error).message || "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsDepositing(false);
      setSelectedAsset(null);
    }
  };

  // Handle withdraw action
  const handleWithdraw = async (amount: string, assetSymbol: string) => {
    if (!walletAddress || !walletProvider) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsWithdrawing(true);
      setSelectedAsset(assetSymbol);
      
      // Find the asset
      const asset = stakingAssets.find(a => a.symbol === assetSymbol);
      if (!asset) throw new Error("Asset not found");
      
      // Get a signer for the transaction
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      
      // Execute the unstaking transaction
      const tx = await StakingService.unstakeTokens(signer, amount, asset.decimals);
      
      toast({
        title: "Withdrawal Transaction Sent",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-4)}`,
      });
      
      // Wait for transaction confirmation
      await tx.wait();
      
      toast({
        title: "Withdrawal Successful",
        description: `Successfully withdrew ${amount} ${asset.symbol}`,
      });
      
      // Refresh staking assets if callback provided
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal Failed",
        description: `Error: ${(error as Error).message || "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
      setSelectedAsset(null);
    }
  };

  if (extendedAssets.length === 0) {
    return (
      <div className="text-center p-8">
        <p>No stakable assets found in your wallet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
      {extendedAssets.map((asset) => (
        <div key={asset.symbol}>
          <h3 className="font-semibold text-xl mb-3">{asset.name} ({asset.symbol})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EarnDeposit
              walletAddress={walletAddress}
              walletProvider={walletProvider}
              asset={asset}
              onDeposit={handleDeposit}
              isProcessing={isDepositing && selectedAsset === asset.symbol}
            />
            
            <EarnWithdraw
              walletAddress={walletAddress}
              walletProvider={walletProvider}
              asset={asset}
              onWithdraw={handleWithdraw}
              isProcessing={isWithdrawing && selectedAsset === asset.symbol}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Earn;
