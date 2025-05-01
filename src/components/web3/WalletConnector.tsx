
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";

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

type WalletType = "metamask" | "phantom" | "coinbase";

const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect, className = "" }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<Record<WalletType, boolean>>({
    metamask: false,
    phantom: false,
    coinbase: false
  });
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const { toast } = useToast();

  // Check if wallets are available
  useEffect(() => {
    const checkWalletAvailability = () => {
      const wallets = {
        metamask: !!window.ethereum?.isMetaMask,
        phantom: !!(window.phantom?.solana), 
        coinbase: !!(window.coinbaseWalletExtension)
      };
      
      setAvailableWallets(wallets);
      setHasWallet(Object.values(wallets).some(Boolean));
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
      console.log("MetaMask not found");
      return null;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        // Get ENS name if available
        let name;
        try {
          if (window.ethers) {
            const provider = new window.ethers.providers.Web3Provider(window.ethereum);
            name = await provider.lookupAddress(accounts[0]);
          }
        } catch (error) {
          console.log("Could not fetch ENS name:", error);
        }
        
        return { address: accounts[0], name };
      }
    } catch (error) {
      console.error("MetaMask connection error:", error);
    }
    return null;
  };

  const connectPhantom = async () => {
    const phantom = window.phantom?.solana;
    
    if (!phantom) {
      console.log("Phantom not found");
      return null;
    }

    try {
      const { publicKey } = await phantom.connect();
      if (publicKey) {
        return { address: publicKey.toString(), name: undefined };
      }
    } catch (error) {
      console.error("Phantom connection error:", error);
    }
    return null;
  };

  const connectCoinbase = async () => {
    const coinbaseWallet = window.coinbaseWalletExtension;
    
    if (!coinbaseWallet) {
      console.log("Coinbase Wallet not found");
      return null;
    }

    try {
      const accounts = await coinbaseWallet.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        return { address: accounts[0], name: undefined };
      }
    } catch (error) {
      console.error("Coinbase Wallet connection error:", error);
    }
    return null;
  };

  const connectWallet = async (walletType?: WalletType) => {
    setIsConnecting(true);
    
    try {
      let result;
      
      if (walletType) {
        // Connect to specific wallet if specified
        switch (walletType) {
          case 'coinbase':
            result = await connectCoinbase();
            break;
          case 'metamask':
            result = await connectMetamask();
            break;
          case 'phantom':
            result = await connectPhantom();
            break;
        }
      } else {
        // Try connecting to wallets in order of preference
        result = await connectCoinbase() || 
                 await connectMetamask() || 
                 await connectPhantom();
      }
      
      if (result) {
        onConnect(result.address, result.name);
        setShowWalletSelector(false);
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
      } else {
        toast({
          title: "Connection failed",
          description: "Could not connect to wallet",
          variant: "destructive"
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    if (availableWallets.coinbase || availableWallets.metamask || availableWallets.phantom) {
      setShowWalletSelector(true);
    } else {
      connectWallet();
    }
  };

  return (
    <>
      <Button 
        onClick={handleConnect} 
        className={`bg-[#0052FF] hover:bg-[#0039B3] text-white ${className}`}
        disabled={isConnecting}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>

      <Dialog open={showWalletSelector} onOpenChange={setShowWalletSelector}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Select which wallet you want to connect with
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {availableWallets.coinbase && (
              <Button 
                onClick={() => connectWallet('coinbase')}
                className="w-full bg-[#0052FF] hover:bg-[#0039B3] text-white"
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Coinbase Wallet"}
              </Button>
            )}
            {availableWallets.metamask && (
              <Button 
                onClick={() => connectWallet('metamask')}
                className="w-full bg-[#F6851B] hover:bg-[#E2761B] text-white"
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "MetaMask"}
              </Button>
            )}
            {availableWallets.phantom && (
              <Button 
                onClick={() => connectWallet('phantom')}
                className="w-full bg-[#8A5FFF] hover:bg-[#7349CC] text-white"
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Phantom"}
              </Button>
            )}
            {!availableWallets.coinbase && !availableWallets.metamask && !availableWallets.phantom && (
              <div className="text-center p-4">
                <p className="mb-4">No wallet extensions detected</p>
                <Button 
                  onClick={() => window.open("https://coinbase.com/wallet", "_blank")}
                  variant="outline"
                >
                  Install Coinbase Wallet
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnector;
