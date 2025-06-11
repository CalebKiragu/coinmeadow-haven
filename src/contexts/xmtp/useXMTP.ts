import { useEffect, useState } from "react";
import {
  useClient,
  Client,
  Conversation,
  DecodedMessage,
} from "@xmtp/react-sdk";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setXMTPConfig, triggerPrompt } from "@/lib/redux/slices/web3Slice";
import { getEnvironmentConfig } from "@/lib/utils";
import { parseMessage } from "@/components/chat/Regex";
import { createSimulatedMessage } from "./createSimulatedMessage";
import { extractSerializableMessage } from "./useChats";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

const STORAGE_KEY = "xmtp_chat_messages";
const AGENT_ADDRESS = getEnvironmentConfig().agentAddress;

export function useXMTP() {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const chainClient = usePublicClient({ chainId });
  const { wallet } = useAppSelector((state) => state.web3);
  const [isXMTPConnected, setIsXMTPConnected] = useState(false);
  // const [xmtpClient, setXmtpClient] = useState<XMTPClient | null>(null);
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);

  const [xmtpLoading, setXMTPLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DecodedMessage[]>([]);

  const { client, error, isLoading, initialize, disconnect } = useClient();
  // const { startConversation } = useStartConversation()

  const initXMTP = async () => {
    if (!walletClient) return;
    setXMTPLoading(true);
    // const signer = getXMTPCompatibleSigner(walletClient, chainId, "EOA");
    let xmtp;

    try {
      console.log("starting XMTP init >> ");
      xmtp = await initialize({
        signer: walletClient,
        options: { env: "production" },
      });
      setIsXMTPConnected(true);
      setXmtpClient(xmtp);
      setXMTPLoading(false);
      console.log("XMTP Client created");
    } catch (err) {
      setXMTPLoading(false);
      setIsXMTPConnected(false);
      console.error("XMTP Client error: ", err);
    } finally {
      setXMTPLoading(false);
    }
  };

  useEffect(() => {
    if (!client) initXMTP();
  }, [walletClient]);

  // Load messages from localStorage on mount
  useEffect(() => {}, []);

  useEffect(() => {
    // if (conversation) updateXMTPConfig();
    // console.log(conversation);

    if (conversation)
      dispatch(
        setXMTPConfig({
          xmtp: { peer: conversation?.peerAddress },
        })
      );
  }, [conversation]);

  // Persist only agent messages to localStorage on change
  useEffect(() => {
    if (messages && messages.length > 0)
      if (messages[0].recipientAddress !== AGENT_ADDRESS) return;
    if (messages.length > 0) {
      const serializableData = messages?.map((msg) =>
        extractSerializableMessage(msg)
      );
      const jsonData = JSON.stringify(serializableData);
      localStorage.setItem(STORAGE_KEY, jsonData);
    }
  }, [messages]);

  const startConversation = async (peer: string) => {
    if (!xmtpClient) {
      toast({
        title: "Wallet not detected",
        description: "Please sign your wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    const canMessage = await xmtpClient.canMessage([peer]);
    // console.log("can message >> ", canMessage);
    if (!canMessage) {
      toast({
        title: "Peer not registered",
        description: "Cannot message this address.",
        variant: "destructive",
      });
      // console.warn("Cannot message this user.");
      return;
    }
    let convo;
    try {
      convo = await xmtpClient.conversations.newConversation(peer);
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
    const stored = loadMessages(peer);
    // console.log("stored >> ", stored);

    const existing = (await convo.messages()).map((obj) => ({
      ...obj,
      ["recipientAddress"]: peer,
    }));
    // console.log("existing >> ", existing);

    setMessages(
      [
        ...new Map(
          [...stored, ...existing].map((msg) => [msg.id, msg])
        ).values(),
      ].sort((a, b) => a.sent - b.sent)
    );

    // => .sort((a, b) => a.timestamp - b.timestamp)
    // const newMessages = existing.filter(
    //   (m) => !messages.find((msg) => msg.id === m.id)
    // );
    // if (newMessages.length > 0) {
    //   setMessages((prev) => [...prev, ...newMessages]);
    // }

    // Start streaming
    const streamMessages = async () => {
      const stream = await convo.streamMessages();
      try {
        for await (const msg of stream) {
          // console.log("new msg >> ", msg);

          setMessages((prev) => {
            const alreadyExists = prev.some((m) => m.id === msg.id);
            return alreadyExists ? prev : [...prev, msg];
          });
          if (msg.recipientAddress === AGENT_ADDRESS)
            handleAgentPrompt(msg.senderAddress, msg.content);
        }
      } catch (err) {
        console.error("Stream error:", err);
      }
    };
    streamMessages();
  };

  const resetConversation = () => setConversation(null);

  const loadMessages = (peer: string): DecodedMessage[] => {
    if (peer !== AGENT_ADDRESS) return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: DecodedMessage[] = JSON.parse(stored);
        if (parsed[0].recipientAddress === peer) return parsed;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return [];
  };

  const fetchWalletBalance = async () => {
    const balance = await chainClient.getBalance({ address });
    return formatEther(BigNumber.from(balance.toString()));
  };

  const sendMessage = async (text: string) => {
    if (!conversation) return;
    let cmd;
    if (conversation.peerAddress === AGENT_ADDRESS) cmd = parseMessage(text);
    await conversation.send(text).catch((error) => console.log(error));

    if (conversation.peerAddress === AGENT_ADDRESS)
      handleAgentPrompt(conversation.peerAddress, text);
    if (cmd)
      dispatch(triggerPrompt({ prompt: { openDialog: true, prompt: cmd } }));
  };

  const handleAgentPrompt = async (peer: string, content: string) => {
    const lower = content.toLowerCase();
    let reply = `Sorry, I didn't understand that. Try "balance" or "send".`;

    if (lower.includes("balance")) {
      reply = `Your balance is ${await fetchWalletBalance()} ETH.`;
    } else if (lower.includes("chain id")) {
      reply = `Active chain: ${wallet.chain}. ID: ${chainId}`;
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
    startConversation,
    resetConversation,
    conversation,
    sendMessage,
    messages,
  };
}
