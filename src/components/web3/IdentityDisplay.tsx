
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WalletConnector from "./WalletConnector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Wallet, Identity } from "@coinbase/onchainkit";

interface IdentityDisplayProps {
  compact?: boolean;
  showCopy?: boolean;
  address?: string;
  ensName?: string;
  showDisconnect?: boolean;
  provider?: any;
}

const IdentityDisplay = ({ 
  compact = false, 
  showCopy = true,
  showDisconnect = true,
  address,
  ensName,
  provider
}: IdentityDisplayProps) => {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string | undefined>(address);
  const [displayName, setDisplayName] = useState<string | undefined>(ensName);
  const [walletProvider, setWalletProvider] = useState<any>(provider);
  
  // Try to load wallet details from localStorage on component mount
  useEffect(() => {
    if (!walletAddress) {
      const savedAddress = localStorage.getItem('walletAddress');
      const savedName = localStorage.getItem('walletName');
      
      if (savedAddress) {
        setWalletAddress(savedAddress);
        if (savedName) setDisplayName(savedName);
      }
    }
  }, [walletAddress]);
  
  const handleWalletConnect = (newAddress: string, name?: string, provider?: any) => {
    setWalletAddress(newAddress);
    if (name) setDisplayName(name);
    setWalletProvider(provider);
    
    // Save to localStorage for persistence
    localStorage.setItem('walletAddress', newAddress);
    if (name) localStorage.setItem('walletName', name);
  };

  const handleDisconnect = () => {
    setWalletAddress(undefined);
    setDisplayName(undefined);
    setWalletProvider(undefined);
    
    // Remove from localStorage
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletName');
    
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected successfully",
    });
  };

  const handleCopy = (text?: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  // If no wallet is connected, show connect button
  if (!walletAddress) {
    return (
      <WalletConnector 
        onConnect={handleWalletConnect}
        className={compact ? "text-xs py-1 h-7" : ""}
      />
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Avatar className={compact ? "h-6 w-6" : "h-8 w-8"}>
        <AvatarImage src={`https://effigy.im/a/${walletAddress}.svg`} alt="User" />
        <AvatarFallback>WL</AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-medium ${compact ? "text-xs" : "text-sm"}`}>
            {displayName || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
          </span>
          
          {showCopy && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1"
                    onClick={() => handleCopy(walletAddress)}
                  >
                    <Copy className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />
                    <span className="sr-only">Copy address</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy wallet address</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {showDisconnect && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-100"
                    onClick={handleDisconnect}
                  >
                    <LogOut className="h-3 w-3" />
                    <span className="sr-only">Disconnect wallet</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Disconnect wallet</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {!compact && (
          <span className="text-xs text-muted-foreground">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</span>
        )}
      </div>
    </div>
  );
}

export default IdentityDisplay;
