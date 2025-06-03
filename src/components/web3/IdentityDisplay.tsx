import {
  Avatar,
  Identity,
  Name,
  Badge,
  Address,
} from "@coinbase/onchainkit/identity";
import { useAppSelector } from "@/lib/redux/hooks";
import { getEnvironmentConfig } from "@/lib/utils";
import { useWallet } from "@/contexts/Web3ContextProvider";
import Web3Connector from "./Web3Connector";
import ChainSwitcher from "./ChainSwitcher";
import DisconnectButton from "./DisconnectButton";

interface IdentityDisplayProps {
  compact?: boolean;
  showDisconnect?: boolean;
}

const IdentityDisplay = ({
  compact = false,
  showDisconnect = true,
}: IdentityDisplayProps) => {
  const { wallet } = useAppSelector((state) => state.web3);
  const { switchNetwork } = useWallet();

  // If no wallet is connected, show connect button
  if (!wallet || !wallet.address) {
    return <Web3Connector className={compact ? "text-xs py-1 h-7" : ""} />;
  }

  return (
    <div className={`flex flex-col -mb-4`}>
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

        {showDisconnect && <DisconnectButton />}
      </div>

      <div className={`ml-2 flex items-center`}>
        <h4 className={`font-bold text-sm px-2`}>{wallet?.chain}</h4>
        <span className="h-2 w-2 bg-green-500 rounded-full shadow-green-500 shadow-md inline-block" />

        <ChainSwitcher switchNetwork={switchNetwork} />
      </div>
    </div>
  );
};

export default IdentityDisplay;
