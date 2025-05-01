
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getEnvironmentConfig } from "@/lib/utils";

interface IdentityDisplayProps {
  compact?: boolean;
  showCopy?: boolean;
  address?: string;
}

const IdentityDisplay = ({ 
  compact = false, 
  showCopy = true,
  address 
}: IdentityDisplayProps) => {
  const { toast } = useToast();
  const walletAddress = address || getEnvironmentConfig().walletAddress || "0x859291D42bC0f9d3988209E3a4920a0E30D58016";
  const [avatarError, setAvatarError] = useState(false);
  
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    });
  };

  return (
    <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
      <Avatar className={compact ? "h-5 w-5" : "h-8 w-8"}>
        <AvatarFallback>
          {walletAddress.charAt(2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
          {shortenAddress(walletAddress)}
        </span>
      </div>
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleCopy}
        >
          <Copy className="h-3 w-3" />
          <span className="sr-only">Copy address</span>
        </Button>
      )}
    </div>
  );
};

export default IdentityDisplay;
