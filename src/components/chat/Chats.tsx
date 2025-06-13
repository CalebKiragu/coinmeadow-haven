import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { Button } from "../ui/button";
import { useWallet } from "@/contexts/Web3ContextProvider";
import { ChatBubble } from "./ChatBubble";
import { Address } from "@coinbase/onchainkit/identity";
import Web3Connector from "../web3/Web3Connector";
import ChainSwitcher from "../web3/ChainSwitcher";
import DisconnectButton from "../web3/DisconnectButton";
import { Skeleton } from "../ui/skeleton";
import { Send } from "lucide-react";
import ConnectPeer from "../web3/ConnectPeer";
import { getEnvironmentConfig } from "@/lib/utils";

interface ChatsProps {
  compact?: boolean;
  showDisconnect?: boolean;
}

const Chats = ({ compact = true, showDisconnect = true }: ChatsProps) => {
  const { wallet, xmtp } = useAppSelector((state) => state.web3);
  const {
    address,
    switchNetwork,
    conversation,
    startConversation,
    resetConversation,
    sendMessage,
    messages,
    isXMTPConnected,
    xmtpLoading,
  } = useWallet();
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
              <div className="flex flex-col">
                <span className="text-sm mt-2">My Agent:</span>
                <ConnectPeer
                  handleStartConversation={handleStartConvo}
                  isAgent
                />
              </div>
              {xmtp ? (
                <div className="flex flex-col">
                  <span className="text-sm mt-2">Recents:</span>
                  <ConnectPeer
                    handleStartConversation={handleStartConvo}
                    peerAddress={xmtp?.peer}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-sm">
              <span>Signature request not successful.</span>
              <br></br>
              <span>Please reload the page or reconnect your wallet.</span>
            </div>
          )}
        </div>
      )}

      {conversation ? (
        <>
          <div>
            <div className="flex items-center justify-evenly">
              {getEnvironmentConfig().agentAddress ===
              conversation?.peerAddress ? (
                <span className="text-sm font-black">My Agent</span>
              ) : (
                <Address address={`0x${conversation?.peerAddress.slice(2)}`} />
              )}

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
            className="min-h-[5px] max-h-[200px] overflow-y-scroll scrollbar-thin flex flex-col-reverse border-dotted rounded p-2"
            ref={chatContainerRef}
          >
            {messages
              ?.slice()
              .reverse()
              .map((msg, i) => (
                <div
                  onClick={() => setText(msg.content)}
                  key={i}
                  className="text-wrap break-words"
                >
                  <ChatBubble
                    key={i}
                    text={msg.content}
                    fromSelf={msg.senderAddress === address}
                  />
                </div>
              ))}
          </div>

          <div className="flex gap-2 mt-2" onKeyDown={handleEnterToSend}>
            <input
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-green-600 text-white rounded"
              disabled={sendDisabled}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Chats;
