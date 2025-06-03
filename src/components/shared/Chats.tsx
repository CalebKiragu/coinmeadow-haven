import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { Button } from "../ui/button";
import { useXMTP } from "@/contexts/xmtp/useXMTP";
import { useWallet } from "@/contexts/Web3ContextProvider";
import { ChatBubble } from "./ChatBubble";
import { Address } from "@coinbase/onchainkit/identity";
import Web3Connector from "../web3/Web3Connector";
import ChainSwitcher from "../web3/ChainSwitcher";
import DisconnectButton from "../web3/DisconnectButton";
import { Skeleton } from "../ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Link } from "lucide-react";
import { ApiService } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getEnvironmentConfig } from "@/lib/utils";

interface ChatsProps {
  compact?: boolean;
  showDisconnect?: boolean;
}

const Chats = ({ compact = true, showDisconnect = true }: ChatsProps) => {
  const { wallet, xmtp } = useAppSelector((state) => state.web3);
  const { address, switchNetwork, depositAddress } = useWallet();
  const {
    conversation,
    startConversation,
    resetConversation,
    sendMessage,
    messages,
    isXMTPConnected,
    xmtpLoading,
  } = useXMTP();
  const [peer, setPeer] = useState("");
  const [text, setText] = useState("");
  const [sendDisabled, setSendDisabled] = useState(true);
  const [startDisabled, setStartDisabled] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0; // since reversed
    }
  }, [messages]);

  useEffect(() => {
    if (text) {
      setSendDisabled(false);
    } else setSendDisabled(true);
  }, [text, peer, xmtp]);

  useEffect(() => {
    if (peer || xmtp?.peer) {
      setStartDisabled(false);
    } else setStartDisabled(true);
  }, [peer, xmtp]);

  const handleEnterToSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEnterToStart = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleStartConvo(peer);
    }
  };

  const handleStartConvo = (peerAddress) => {
    if (!peerAddress) if (peer && peer.trim()) return startConversation(peer);
    if (typeof peerAddress === "string" && peerAddress.trim())
      startConversation(peerAddress);
  };

  const handleSendMessage = () => {
    if (text && text.trim()) {
      sendMessage(text);
      setText(""); // clear input
    }
  };

  // If no wallet is connected, show connect button
  if (!wallet || !wallet.address) {
    return <Web3Connector className={compact ? "text-xs py-1 h-7" : ""} />;
  }

  return (
    <div className="max-w-full self-center pb-2">
      {!conversation && (
        <div
          className="relative animate-scale-in w-full"
          onKeyDown={handleEnterToStart}
        >
          {xmtpLoading ? (
            <div className="space-y-2 w-full">
              <Skeleton height="h-5" width="w-full" className="bg-gray-500" />
              <Skeleton height="h-3" width="w-full" className="bg-gray-500" />
            </div>
          ) : isXMTPConnected ? (
            <>
              <input
                placeholder="Receiver wallet address"
                value={peer}
                onChange={(e) => setPeer(e.target.value)}
                className="w-full border p-2 rounded mb-2"
              />
              <Button
                onClick={handleStartConvo}
                className="w-full bg-blue-600 rounded"
                disabled={startDisabled}
              >
                Start Chat
              </Button>

              {xmtp ? (
                <div className="flex flex-col">
                  <span className="text-sm mt-2">My Agent:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:text-blue-600 hover:bg-red-100"
                          onClick={() =>
                            handleStartConvo(
                              getEnvironmentConfig().agentAddress
                            )
                          }
                        >
                          <Address
                            address={`0x${getEnvironmentConfig().agentAddress?.slice(
                              2
                            )}`}
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

                  <span className="text-sm mt-2">Recents:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:text-blue-600 hover:bg-red-100"
                          onClick={() => handleStartConvo(xmtp?.peer)}
                        >
                          <Address
                            address={xmtp?.peer}
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
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-sm">
              <span>Signature request not successful.</span>
              <br></br>
              <span>Please try again.</span>
            </div>
          )}
        </div>
      )}

      {conversation ? (
        <>
          <div>
            <div className="flex items-center justify-evenly">
              <Address address={xmtp?.peer} />
              <Button variant="link" onClick={() => resetConversation()}>
                Change Peer
              </Button>
            </div>
            <div className="flex items-center justify-evenly">
              <div className={`flex items-center`}>
                <h4 className={`font-bold text-sm pr-1`}>{wallet?.chain}</h4>
                <span className="h-2 w-2 bg-green-500 rounded-full shadow-green-500 shadow-md inline-block" />
                <ChainSwitcher switchNetwork={switchNetwork} />
              </div>
              {showDisconnect && <DisconnectButton />}
            </div>
          </div>

          <div
            className="min-h-[5px] max-h-[200px] overflow-y-scroll scrollbar-none flex flex-col-reverse border-dotted rounded p-2"
            ref={chatContainerRef}
          >
            {messages
              ?.slice()
              .reverse()
              .map((msg, i) => (
                <ChatBubble
                  key={i}
                  text={msg.content}
                  fromSelf={msg.senderAddress === address}
                />
              ))}
          </div>

          <div className="flex gap-2" onKeyDown={handleEnterToSend}>
            <input
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-green-600 text-white p-2 rounded"
              disabled={sendDisabled}
            >
              Send
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Chats;
