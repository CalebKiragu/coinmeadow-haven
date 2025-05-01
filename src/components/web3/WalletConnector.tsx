import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Declare ethereum on window to avoid TypeScript errors
declare global {
  interface Window {
    ethereum?: any;
    phantom?: {
      solana?: any;
    };
    coinbaseWalletExtension?: any;
    ethers?: any;
  }
}

interface WalletConnectorProps {
  onConnect: (address: string, name?: string) => void;
  className?: string;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect, className = "" }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const { toast } = useToast();

  // Check if wallets are available
  useEffect(() => {
    const checkWalletAvailability = () => {
      if (window.ethereum || 
          (window as any).phantom?.solana || 
          (window as any).coinbaseWalletExtension) {
        setHasWallet(true);
      }
    };
    
    checkWalletAvailability();
    
    // Listen for wallet injections that might happen after page load
    window.addEventListener('DOMContentLoaded', checkWalletAvailability);
    
    return () => {
      window.removeEventListener('DOMContentLoaded', checkWalletAvailability);
    };
  }, []);

  const connectMetamask = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet not found",
        description: "MetaMask extension is not installed",
        variant: "destructive"
      });
      return null;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        // Get ENS name if available
        let name;
        try {
          const provider = new (window as any).ethers.providers.Web3Provider(window.ethereum);
          name = await provider.lookupAddress(accounts[0]);
        } catch (error) {
          console.log("Could not fetch ENS name:", error);
        }
        
        return { address: accounts[0], name };
      }
    } catch (error) {
      console.error("MetaMask connection error:", error);
      toast({
        title: "Connection failed",
        description: "Could not connect to MetaMask",
        variant: "destructive"
      });
    }
    return null;
  };

  const connectPhantom = async () => {
    const phantom = (window as any).phantom?.solana;
    
    if (!phantom) {
      toast({
        title: "Wallet not found",
        description: "Phantom extension is not installed",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { publicKey } = await phantom.connect();
      if (publicKey) {
        return { address: publicKey.toString(), name: undefined };
      }
    } catch (error) {
      console.error("Phantom connection error:", error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Phantom",
        variant: "destructive"
      });
    }
    return null;
  };

  const connectCoinbase = async () => {
    const coinbaseWallet = (window as any).coinbaseWalletExtension;
    
    if (!coinbaseWallet) {
      toast({
        title: "Wallet not found",
        description: "Coinbase Wallet extension is not installed",
        variant: "destructive"
      });
      return null;
    }

    try {
      const accounts = await coinbaseWallet.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        return { address: accounts[0], name: undefined };
      }
    } catch (error) {
      console.error("Coinbase Wallet connection error:", error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Coinbase Wallet",
        variant: "destructive"
      });
    }
    return null;
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Try connecting to wallets in order of preference
      let result = await connectCoinbase() || 
                   await connectMetamask() || 
                   await connectPhantom();
      
      if (result) {
        onConnect(result.address, result.name);
        toast({
          title: "Wallet connected",
          description: `Connected to ${result.address.slice(0, 6)}...${result.address.slice(-4)}`,
        });
      } else if (!hasWallet) {
        // If no wallet is available, suggest installing one
        window.open("https://coinbase.com/wallet", "_blank");
        toast({
          title: "No wallet found",
          description: "Please install a wallet extension",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button 
      onClick={handleConnect} 
      className={`bg-[#0052FF] hover:bg-[#0039B3] text-white ${className}`}
      disabled={isConnecting}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnector;
