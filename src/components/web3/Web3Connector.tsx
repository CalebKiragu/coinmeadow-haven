import React from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWallet } from "@/contexts/Web3ContextProvider";

interface Web3ConnectorProps {
  className?: string;
}

const Web3Connector: React.FC<Web3ConnectorProps> = ({ className = "" }) => {
  const { openReownModal, isPending } = useWallet();

  return (
    <>
      <Button
        onClick={openReownModal}
        className={`bg-[#0052FF] hover:bg-[#0039B3] text-white ${className}`}
        disabled={isPending}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isPending ? "Connecting..." : "Connect Wallet"}
      </Button>
    </>
  );
};

export default Web3Connector;
