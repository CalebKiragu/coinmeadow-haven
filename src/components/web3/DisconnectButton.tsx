import { useWallet } from "@/contexts/Web3ContextProvider";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { LogOut } from "lucide-react";

const DisconnectButton = () => {
  const { disconnectAll } = useWallet();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-100"
            onClick={disconnectAll}
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
  );
};

export default DisconnectButton;
