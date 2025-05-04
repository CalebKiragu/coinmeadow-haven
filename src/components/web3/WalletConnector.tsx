
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

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
  onConnect: (address: string, name?: string, provider?: any) => void;
  className?: string;
}

type WalletType = "metamask" | "phantom" | "coinbase";

interface WalletInfo {
  type: WalletType;
  name: string;
  logo: React.ReactNode;
  available: boolean;
  installUrl: string;
  bgColor: string;
}

// Helper function to detect if running in a browser environment
const isBrowser = typeof window !== "undefined";

const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect, className = "" }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [installedWallets, setInstalledWallets] = useState<Record<WalletType, boolean>>({
    metamask: false,
    phantom: false,
    coinbase: false
  });
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [anyWalletInstalled, setAnyWalletInstalled] = useState(false);
  const { toast } = useToast();

  // Check if wallets are available
  useEffect(() => {
    if (!isBrowser) return;
    
    const checkWalletAvailability = () => {
      const wallets = {
        metamask: !!window.ethereum?.isMetaMask,
        phantom: !!(window.phantom?.solana), 
        coinbase: !!(window.coinbaseWalletExtension || window.ethereum?.isCoinbaseWallet)
      };
      
      setInstalledWallets(wallets);
      const hasAnyWallet = Object.values(wallets).some(Boolean);
      setAnyWalletInstalled(hasAnyWallet);
      
      // Add a class to document to allow styling based on wallet availability
      if (hasAnyWallet) {
        document.documentElement.classList.add('has-wallet');
      } else {
        document.documentElement.classList.remove('has-wallet');
      }
    };
    
    checkWalletAvailability();
    
    // Check again after a delay to catch late-loading extensions
    const timeoutId = setTimeout(checkWalletAvailability, 1000);
    
    // Listen for wallet injections that might happen after page load
    window.addEventListener('DOMContentLoaded', checkWalletAvailability);
    
    return () => {
      window.removeEventListener('DOMContentLoaded', checkWalletAvailability);
      clearTimeout(timeoutId);
    };
  }, []);

  const walletsList: WalletInfo[] = [
    {
      type: "metamask",
      name: "MetaMask",
      logo: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24.0891 3L15.1521 9.58087L16.7343 5.51304L24.0891 3Z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.9043 3L12.7804 9.63478L11.2673 5.51304L3.9043 3Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20.9543 18.1304L18.5977 21.8609L23.6455 23.3043L25.0938 18.2174L20.9543 18.1304Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2.9126 18.2174L4.35216 23.3043L9.40868 21.8609L7.05216 18.1304L2.9126 18.2174Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.10432 12.0348L7.73475 14.1L12.7347 14.3478L12.563 8.8696L9.10432 12.0348Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.8891 12.0348L15.3934 8.81567L15.2891 14.3478L20.2891 14.1L18.8891 12.0348Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.4087 21.8609L12.4174 20.3044L9.83131 18.2522L9.4087 21.8609Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.5783 20.3044L18.5957 21.8609L18.1652 18.2522L15.5783 20.3044Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      available: installedWallets.metamask,
      installUrl: "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
      bgColor: "#F6851B"
    },
    {
      type: "coinbase",
      name: "Coinbase Wallet",
      logo: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="14" fill="#0052FF"/>
          <path d="M14 6C9.58172 6 6 9.58172 6 14C6 18.4183 9.58172 22 14 22C18.4183 22 22 18.4183 22 14C22 9.58172 18.4183 6 14 6ZM11.4 17.075C10.0745 17.075 9 15.9975 9 14.675C9 13.3496 10.0745 12.275 11.4 12.275C12.7255 12.275 13.8 13.3496 13.8 14.675C13.8 15.9975 12.7255 17.075 11.4 17.075ZM16.6 17.075C15.2745 17.075 14.2 15.9975 14.2 14.675C14.2 13.3496 15.2745 12.275 16.6 12.275C17.9255 12.275 19 13.3496 19 14.675C19 15.9975 17.9255 17.075 16.6 17.075Z" fill="white"/>
        </svg>
      ),
      available: installedWallets.coinbase,
      installUrl: "https://www.coinbase.com/wallet",
      bgColor: "#0052FF"
    },
    {
      type: "phantom",
      name: "Phantom",
      logo: (
        <svg width="28" height="28" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="128" height="128" rx="64" fill="#AB9FF2"/>
          <path d="M110.584 64.9142H99.142C99.142 41.7651 80.1749 23 56.7726 23C33.6533 23 14.8295 41.3577 14.405 64.0883C13.9658 87.7088 33.0569 107 56.7726 107H60.0629C60.9474 107 61.6663 106.287 61.6663 105.409V94.2237C61.6663 93.346 60.9474 92.6329 60.0629 92.6329H56.8439C41.171 92.6329 28.4363 79.9129 28.5789 64.3048C28.7215 49.1199 41.3135 36.8028 56.7013 36.8028C72.089 36.8028 84.6597 49.1199 84.6597 64.2649V105.409C84.6597 106.287 85.3786 107 86.2631 107H97.5387C98.4232 107 99.142 106.287 99.142 105.409V78.8852H110.584C111.469 78.8852 112.188 78.1722 112.188 77.2944V66.5049C112.188 65.6272 111.469 64.9142 110.584 64.9142Z" fill="white"/>
        </svg>
      ),
      available: installedWallets.phantom,
      installUrl: "https://phantom.app/download",
      bgColor: "#8A5FFF"
    }
  ];

  const connectMetamask = async () => {
    if (!window.ethereum?.isMetaMask) {
      console.log("MetaMask not found");
      return null;
    }

    try {
      // Request accounts directly from MetaMask provider
      const provider = new window.ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // Get ENS name if available
      let name;
      try {
        name = await provider.lookupAddress(address);
      } catch (error) {
        console.log("Could not fetch ENS name:", error);
      }
      
      return { address, name, provider };
    } catch (error) {
      console.error("MetaMask connection error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to MetaMask. Please try again.",
        variant: "destructive"
      });
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
      // Connect to Phantom wallet
      const connection = await phantom.connect();
      const { publicKey } = connection;
      if (publicKey) {
        // Here we return only the Phantom-specific provider and data
        return { 
          address: publicKey.toString(), 
          name: undefined,
          provider: phantom
        };
      }
    } catch (error) {
      console.error("Phantom connection error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Phantom. Please try again.",
        variant: "destructive"
      });
    }
    return null;
  };

  const connectCoinbase = async () => {
    const coinbaseWallet = window.coinbaseWalletExtension || 
                          (window.ethereum?.isCoinbaseWallet ? window.ethereum : null);
    
    if (!coinbaseWallet) {
      console.log("Coinbase Wallet not found");
      return null;
    }

    try {
      // Connect to Coinbase wallet
      const provider = new window.ethers.providers.Web3Provider(coinbaseWallet);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      return { address, name: undefined, provider };
    } catch (error) {
      console.error("Coinbase Wallet connection error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Coinbase Wallet. Please try again.",
        variant: "destructive"
      });
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
        onConnect(result.address, result.name, result.provider);
        setShowWalletSelector(false);
        toast({
          title: "Wallet connected",
          description: `Connected to ${result.address.slice(0, 6)}...${result.address.slice(-4)}`,
        });
      } else if (!anyWalletInstalled) {
        // If no wallet is available, suggest installing one
        setShowWalletSelector(true);
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
    if (installedWallets.coinbase || installedWallets.metamask || installedWallets.phantom) {
      setShowWalletSelector(true);
    } else {
      connectWallet();
    }
  };

  const handleWalletInstall = (url: string) => {
    window.open(url, "_blank");
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
            {anyWalletInstalled ? (
              walletsList.map((wallet) => (
                <Button
                  key={wallet.type}
                  onClick={() => wallet.available ? connectWallet(wallet.type) : handleWalletInstall(wallet.installUrl)}
                  className={`w-full flex justify-start items-center ${wallet.available ? `bg-${wallet.bgColor} hover:bg-opacity-90` : 'bg-gray-200 dark:bg-gray-700'} text-white`}
                  style={{ backgroundColor: wallet.available ? wallet.bgColor : undefined }}
                  disabled={isConnecting}
                >
                  <div className="mr-2">{wallet.logo}</div>
                  <span className="flex-grow text-left">
                    {wallet.available ? `Connect to ${wallet.name}` : `Install ${wallet.name}`}
                  </span>
                </Button>
              ))
            ) : (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4 flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium mb-2">No Wallets Detected</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      To use DeFi features, please install one of these wallet extensions:
                    </p>
                    <div className="grid gap-2">
                      {walletsList.map((wallet) => (
                        <Button
                          key={wallet.type}
                          variant="outline"
                          className="w-full flex justify-between items-center"
                          onClick={() => handleWalletInstall(wallet.installUrl)}
                        >
                          <div className="flex items-center">
                            {wallet.logo}
                            <span className="ml-2">{wallet.name}</span>
                          </div>
                          <span className="text-xs">Install</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnector;
