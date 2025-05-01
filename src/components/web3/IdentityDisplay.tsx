
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getEnvironmentConfig } from "@/lib/utils";
import WalletConnector from "./WalletConnector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IdentityDisplayProps {
  compact?: boolean;
  showCopy?: boolean;
  address?: string;
  ensName?: string;
  showDisconnect?: boolean;
}

const IdentityDisplay = ({ 
  compact = false, 
  showCopy = true,
  showDisconnect = true,
  address,
  ensName
}: IdentityDisplayProps) => {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string | undefined>(address);
  const [displayName, setDisplayName] = useState<string | undefined>(ensName);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const [avatarError, setAvatarError] = useState(false);
  
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

  // Try to generate avatar for the wallet
  useEffect(() => {
    if (walletAddress) {
      // Try to get ENS avatar if available
      try {
        setAvatarSrc(`https://effigy.im/a/${walletAddress}.svg`);
      } catch (error) {
        console.error("Error fetching avatar:", error);
        setAvatarError(true);
      }
    }
  }, [walletAddress]);
  
  const handleWalletConnect = (newAddress: string, name?: string) => {
    setWalletAddress(newAddress);
    if (name) setDisplayName(name);
    
    // Save to localStorage for persistence
    localStorage.setItem('walletAddress', newAddress);
    if (name) localStorage.setItem('walletName', name);
  };

  const handleDisconnect = () => {
    setWalletAddress(undefined);
    setDisplayName(undefined);
    
    // Remove from localStorage
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletName');
    
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected successfully",
    });
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
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
    <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
      <Avatar className={compact ? "h-6 w-6" : "h-9 w-9"}>
        <AvatarImage
          src={avatarSrc}
          alt="Wallet"
          onError={() => setAvatarError(true)}
        />
        <AvatarFallback>
          {displayName?.charAt(0) || walletAddress.charAt(2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        {displayName && (
          <span className={`font-medium ${compact ? "text-xs" : "text-sm"}`}>
            {displayName}
          </span>
        )}
        <span className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
          {shortenAddress(walletAddress)}
        </span>
      </div>
      {showCopy && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
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
  );
};

export default IdentityDisplay;
