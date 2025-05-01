
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
    xdefi?: any;
    keplr?: any;
    terraWallets?: any;
    algorand?: any;
    solflare?: any;
    tally?: any;
    leap?: any;
    avalanche?: any;
    trustWallet?: any;
    bitpie?: any;
    ethers?: any;
    binanceChain?: any;
  }
}

interface WalletConnectorProps {
  onConnect: (address: string, name?: string) => void;
  onDisconnect?: () => void;
  className?: string;
}

type WalletType = 
  | "metamask" 
  | "phantom" 
  | "coinbase" 
  | "trustwallet" 
  | "xdefi" 
  | "solflare" 
  | "tally" 
  | "binance" 
  | "keplr"
  | "other";

interface WalletInfo {
  name: string;
  type: WalletType;
  icon: string;
  available: boolean;
  color: string;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect, onDisconnect, className = "" }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const { toast } = useToast();

  // Check if wallets are available
  useEffect(() => {
    const checkWalletAvailability = () => {
      const walletList: WalletInfo[] = [
        {
          name: "MetaMask",
          type: "metamask",
          icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
          available: !!window.ethereum?.isMetaMask,
          color: "#F6851B"
        },
        {
          name: "Coinbase Wallet",
          type: "coinbase",
          icon: "https://www.coinbase.com/assets/press/coinbase-mark-4d74d3ab227c286cf8b6485c487f9bcdfb5fc694d590fcc173622de285881ed0.png",
          available: !!window.coinbaseWalletExtension || (window.ethereum?.isCoinbaseWallet === true),
          color: "#0052FF"
        },
        {
          name: "Phantom",
          type: "phantom",
          icon: "https://phantom.app/favicon.ico",
          available: !!(window.phantom?.solana),
          color: "#8A5FFF"
        },
        {
          name: "Trust Wallet",
          type: "trustwallet",
          icon: "https://trustwallet.com/assets/images/favicon.ico",
          available: !!(window.trustWallet) || (window.ethereum?.isTrust === true),
          color: "#3375BB"
        },
        {
          name: "Binance Wallet",
          type: "binance",
          icon: "https://public.bnbstatic.com/static/images/common/favicon.ico",
          available: !!(window.binanceChain) || (window.ethereum?.isBinance === true),
          color: "#F0B90B"
        },
        {
          name: "Solflare",
          type: "solflare",
          icon: "https://solflare.com/assets/favicon-32x32.png",
          available: !!(window.solflare),
          color: "#FC812B"
        },
        {
          name: "Tally",
          type: "tally",
          icon: "https://tally.cash/favicon.ico",
          available: !!(window.tally),
          color: "#D08E39"
        },
        {
          name: "Keplr",
          type: "keplr",
          icon: "https://www.keplr.app/favicon.ico",
          available: !!(window.keplr),
          color: "#11B4FF"
        }
      ];

      // If ethereum is available but none of the known wallets is detected
      if (window.ethereum && !walletList.some(wallet => wallet.available)) {
        walletList.push({
          name: "Web3 Wallet",
          type: "other",
          icon: "https://cdn-icons-png.flaticon.com/512/2089/2089400.png",
          available: true,
          color: "#333333"
        });
      }
      
      const available = walletList.filter(wallet => wallet.available);
      setAvailableWallets(available);
      setHasWallet(available.length > 0);
    };
    
    checkWalletAvailability();
    
    // Listen for wallet injections that might happen after page load
    window.addEventListener('DOMContentLoaded', checkWalletAvailability);
    
    return () => {
      window.removeEventListener('DOMContentLoaded', checkWalletAvailability);
    };
  }, []);

  const connectMetamask = async () => {
    if (!window.ethereum?.isMetaMask) {
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
      throw error;
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
      throw error;
    }
    return null;
  };

  const connectCoinbase = async () => {
    const coinbaseWallet = window.coinbaseWalletExtension || (window.ethereum?.isCoinbaseWallet ? window.ethereum : null);
    
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
      throw error;
    }
    return null;
  };

  const connectTrustWallet = async () => {
    const trustWallet = window.trustWallet || (window.ethereum?.isTrust ? window.ethereum : null);
    
    if (!trustWallet) {
      console.log("Trust Wallet not found");
      return null;
    }

    try {
      const accounts = await trustWallet.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        return { address: accounts[0], name: undefined };
      }
    } catch (error) {
      console.error("Trust Wallet connection error:", error);
      throw error;
    }
    return null;
  };

  const connectBinanceWallet = async () => {
    const binanceWallet = window.binanceChain || (window.ethereum?.isBinance ? window.ethereum : null);
    
    if (!binanceWallet) {
      console.log("Binance Wallet not found");
      return null;
    }

    try {
      const accounts = await binanceWallet.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        return { address: accounts[0], name: undefined };
      }
    } catch (error) {
      console.error("Binance Wallet connection error:", error);
      throw error;
    }
    return null;
  };

  const connectSolflare = async () => {
    const solflare = window.solflare;
    
    if (!solflare) {
      console.log("Solflare not found");
      return null;
    }

    try {
      const { publicKey } = await solflare.connect();
      if (publicKey) {
        return { address: publicKey.toString(), name: undefined };
      }
    } catch (error) {
      console.error("Solflare connection error:", error);
      throw error;
    }
    return null;
  };

  const connectTally = async () => {
    const tally = window.tally || (window.ethereum?.isTally ? window.ethereum : null);
    
    if (!tally) {
      console.log("Tally not found");
      return null;
    }

    try {
      const accounts = await tally.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        return { address: accounts[0], name: undefined };
      }
    } catch (error) {
      console.error("Tally connection error:", error);
      throw error;
    }
    return null;
  };

  const connectKeplr = async () => {
    const keplr = window.keplr;
    
    if (!keplr) {
      console.log("Keplr not found");
      return null;
    }

    try {
      const chainId = "cosmoshub-4"; // Use appropriate chain ID
      await keplr.enable(chainId);
      const offlineSigner = keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      if (accounts.length > 0) {
        return { address: accounts[0].address, name: accounts[0].name };
      }
    } catch (error) {
      console.error("Keplr connection error:", error);
      throw error;
    }
    return null;
  };

  const connectOtherWallet = async () => {
    // Generic handler for other ethereum-compatible wallets
    if (!window.ethereum) {
      console.log("No ethereum provider found");
      return null;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        return { address: accounts[0], name: undefined };
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      throw error;
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
          case 'trustwallet':
            result = await connectTrustWallet();
            break;
          case 'binance':
            result = await connectBinanceWallet();
            break;
          case 'solflare':
            result = await connectSolflare();
            break;
          case 'tally':
            result = await connectTally();
            break;
          case 'keplr':
            result = await connectKeplr();
            break;
          case 'other':
            result = await connectOtherWallet();
            break;
        }
      } else {
        // Try connecting to the first available wallet
        if (availableWallets.length > 0) {
          const firstWallet = availableWallets[0];
          return connectWallet(firstWallet.type);
        }
      }
      
      if (result) {
        onConnect(result.address, result.name);
        setShowWalletSelector(false);
        toast({
          title: "Wallet connected",
          description: `Connected to ${result.address.slice(0, 6)}...${result.address.slice(-4)}`,
        });
      } else {
        // If we attempted to connect but failed
        toast({
          title: "Connection failed",
          description: "Could not connect to wallet",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Could not connect to wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    if (availableWallets.length > 0) {
      setShowWalletSelector(true);
    } else {
      // Suggest installing wallet
      window.open("https://metamask.io/download/", "_blank");
      toast({
        title: "No wallet found",
        description: "Please install a wallet extension",
      });
    }
  };

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
      });
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
            {availableWallets.length > 0 ? (
              availableWallets.map((wallet) => (
                <Button 
                  key={wallet.type}
                  onClick={() => connectWallet(wallet.type)}
                  className="w-full text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: wallet.color, borderColor: wallet.color }}
                  disabled={isConnecting}
                >
                  {wallet.icon && (
                    <img 
                      src={wallet.icon} 
                      alt={wallet.name} 
                      className="w-5 h-5" 
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  {isConnecting ? "Connecting..." : wallet.name}
                </Button>
              ))
            ) : (
              <div className="text-center p-4">
                <p className="mb-4">No wallet extensions detected</p>
                <Button 
                  onClick={() => window.open("https://metamask.io/download/", "_blank")}
                  variant="outline"
                >
                  Install MetaMask
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
