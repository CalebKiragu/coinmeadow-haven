import { Address } from "@coinbase/onchainkit/identity";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Link } from "lucide-react";
import { getEnvironmentConfig } from "@/lib/utils";

interface ConnectPeerProps {
  handleStartConversation?: (address: string) => void;
  peerAddress?: string;
  isAgent?: boolean;
}

const ConnectPeer: React.FC<ConnectPeerProps> = ({
  handleStartConversation,
  peerAddress,
  isAgent = false,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-600 hover:bg-red-100"
            onClick={() =>
              handleStartConversation(
                isAgent ? getEnvironmentConfig().agentAddress : peerAddress
              )
            }
          >
            <Address
              address={
                isAgent
                  ? `0x${getEnvironmentConfig().agentAddress?.slice(2)}`
                  : `0x${peerAddress?.slice(2)}`
              }
              hasCopyAddressOnClick={false}
            />
            <Link className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connect peer</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectPeer;
