import { useEffect, useState } from "react";
import {
  Client as XMTPClient,
  Conversation,
  DecodedMessage,
} from "@xmtp/browser-sdk";
// import { walletClientToEthersSigner } from "@xmtp/browser-sdk/converters";
import { useAccount, useWalletClient } from "wagmi";
import { getXMTPCompatibleSigner } from "./getXMTPCompatibleSigner";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setXMTPConfig, triggerPrompt } from "@/lib/redux/slices/web3Slice";
import { getEnvironmentConfig } from "@/lib/utils";
import { parseMessage } from "@/components/chat/Regex";
import { createSimulatedMessage } from "./createSimulatedMessage";

const STORAGE_KEY = "xmtp_chat_messages";
const AGENT_ADDRESS = getEnvironmentConfig().agentAddress;

export function useXMTP() {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [isXMTPConnected, setIsXMTPConnected] = useState(false);
  const [xmtpClient, setXmtpClient] = useState<XMTPClient | null>(null);
  const [xmtpLoading, setXMTPLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [peerAddress, setPeerAddress] = useState("");
  const [messages, setMessages] = useState<DecodedMessage[]>([]);

  const initXMTP = async () => {
    if (!walletClient) return;
    setXMTPLoading(true);
    const signer = getXMTPCompatibleSigner(walletClient);
    // const signer = walletClientToEthersSigner
    let xmtp;

    try {
      console.log("Wallet Address:", await signer.getIdentifier());
      xmtp = await XMTPClient.create(signer, {
        env: "production",
        // persistConversations: true,
      });
      setIsXMTPConnected(true);
      setXmtpClient(xmtp);
      setXMTPLoading(false);
      console.log("XMTP Client created");
    } catch (err) {
      setXMTPLoading(false);
      setIsXMTPConnected(false);
      console.error("XMTP Client error: ", err);
    }
  };

  useEffect(() => {
    if (!isXMTPConnected || !xmtpClient) initXMTP();
  }, [walletClient]);

  // Load messages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: DecodedMessage[] = JSON.parse(stored);
        setMessages(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (conversation) updateXMTPConfig();
  }, [conversation]);

  const startConversation = async (peer: string) => {
    if (!xmtpClient) {
      toast({
        title: "Wallet not detected",
        description: "Please sign your wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    const canMessage = await xmtpClient.canMessage([
      { identifier: peer, identifierKind: "Ethereum" },
    ]);
    // console.log("can message >> ", canMessage);
    if (!canMessage) {
      toast({
        title: "Peer not registered",
        description: "Cannot message this peer.",
        variant: "destructive",
      });
      // console.warn("Cannot message this user.");
      return;
    }
    let convo;
    try {
      convo = await xmtpClient.conversations.newDm(peer);
    } catch (error) {
      toast({
        title: "Error creating conversation",
        description: error?.message,
        variant: "destructive",
      });
    }
    // console.log("convo >> ", convo);
    if (!convo) return;
    setConversation(convo);

    // Load existing messages
    const existing = await convo.messages();
    console.log("existing >> ", existing);
    const newMessages = existing.filter(
      (m) => !messages.find((msg) => msg.id === m.id)
    );
    if (newMessages.length > 0) {
      setMessages((prev) => [...prev, ...newMessages]);
    }

    // Start streaming
    const streamMessages = async () => {
      const stream = await convo.streamMessages();
      try {
        for await (const msg of stream) {
          console.log("new msg >> ", msg);

          setMessages((prev) => {
            const alreadyExists = prev.some((m) => m.id === msg.id);
            return alreadyExists ? prev : [...prev, msg];
          });
          if (msg.recipientAddress === AGENT_ADDRESS)
            handleAgentPrompt(msg.content);
        }
      } catch (err) {
        console.error("Stream error:", err);
      }
    };
    streamMessages();
  };

  const resetConversation = () => setConversation(null);

  const updateXMTPConfig = async () => {
    const members = await conversation.members();
    const peer = members.flatMap((member) =>
      member.accountIdentifiers
        .filter(
          (id) =>
            id.identifierKind === "Ethereum" &&
            id.identifier.toLowerCase() !== address?.toLowerCase()
        )
        .map((id) => id.identifier)
    )[0]; // assuming 1:1 conversation
    if (peer) setPeerAddress(peer);
    if (peer)
      dispatch(
        setXMTPConfig({
          xmtp: { peer },
        })
      );
    // const peerAddress = me.find(addr => addr.toLowerCase() !== myAddress.toLowerCase()) ?? null;
  };

  const sendMessage = async (text: string) => {
    if (!conversation) return;
    let cmd;
    if (peerAddress === AGENT_ADDRESS) cmd = parseMessage(text);

    if (cmd) console.log("command >> ", cmd);
    // dispatch(triggerPrompt({ prompt: { openDialog: true, prompt: cmd } }));
    await conversation.send(text);
  };

  const handleAgentPrompt = async (content: string) => {
    const lower = content.toLowerCase();
    let reply = 'Sorry, I didn’t understand that. Try "balance" or "send".';

    if (lower.includes("balance")) {
      reply = `Your balance is ${Math.random().toFixed(3)} ETH.`;
    } else if (lower.startsWith("send")) {
      reply = "Transaction submitted! 🚀";
    }

    simulateAgentResponse(reply);
  };

  const simulateAgentResponse = (content: string) => {
    const agentMessage = createSimulatedMessage({
      content,
      senderAddress: AGENT_ADDRESS,
      recipientAddress: address,
      conversationId: "dm-" + AGENT_ADDRESS + "-" + address,
    });

    setTimeout(() => {
      setMessages((prev) => [...prev, agentMessage]);
    }, 500);
  };

  return {
    isXMTPConnected,
    xmtpLoading,
    xmtpClient,
    startConversation,
    resetConversation,
    conversation,
    sendMessage,
    messages,
  };
}
