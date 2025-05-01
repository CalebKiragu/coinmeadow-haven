
import React, { useState } from "react";
import { Vault } from "@coinbase/onchainkit/vault";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getEnvironmentConfig } from "@/lib/utils";

interface EarnButtonProps {
  vaultAddress?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

const EarnButton = ({ 
  vaultAddress, 
  className = "", 
  size = "sm" 
}: EarnButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const config = getEnvironmentConfig();
  const vault = vaultAddress || config.walletAddress || "0x859291D42bC0f9d3988209E3a4920a0E30D58016";

  return (
    <>
      <Button 
        variant="outline" 
        size={size} 
        onClick={() => setDialogOpen(true)} 
        className={className}
      >
        <TrendingUp className="mr-1 h-4 w-4" />
        Stake to Earn
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Stake to Earn</DialogTitle>
            <DialogDescription>
              Stake your tokens to earn yield on your holdings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Vault 
              vaultContractAddress={vault}
              chainId={config.base.id}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EarnButton;
