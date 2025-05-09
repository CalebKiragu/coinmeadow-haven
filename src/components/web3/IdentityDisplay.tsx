import {
  Avatar,
  Identity,
  Name,
  Badge,
  Address,
} from "@coinbase/onchainkit/identity";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletConnector from "./WalletConnector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppSelector } from "@/lib/redux/hooks";
import { getEnvironmentConfig } from "@/lib/utils";
import { useWeb3Wallet } from "@/contexts/Web3ProviderContext";

interface IdentityDisplayProps {
  compact?: boolean;
  showDisconnect?: boolean;
}

const IdentityDisplay = ({
  compact = false,
  showDisconnect = true,
}: IdentityDisplayProps) => {
  const { wallet } = useAppSelector((state) => state.web3);
  const { disconnectWallet } = useWeb3Wallet();

  // If no wallet is connected, show connect button
  if (!wallet || !wallet.address) {
    return <WalletConnector className={compact ? "text-xs py-1 h-7" : ""} />;
  }

  return (
    <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
      <Identity
        address={`0x${wallet?.address?.slice(2)}`}
        schemaId={`0x${getEnvironmentConfig().baseSchemaId?.slice(2)}`}
        className="rounded-full"
      >
        <Avatar />
        <Name>
          <Badge tooltip={true} />
        </Name>
        <Address />
      </Identity>

      {showDisconnect && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-100"
                onClick={disconnectWallet}
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
