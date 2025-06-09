import { useEffect, useState, useRef } from "react";
import { Client, Conversation, DecodedMessage } from "@xmtp/xmtp-js";
import { getEnvironmentConfig } from "@/lib/utils";

export type SimulatedMessage = DecodedMessage & {
  isSimulated?: boolean;
};

const STORAGE_KEY = "xmtp_chat_messages";
const AGENT_ADDRESS = getEnvironmentConfig().agentAddress;

export function useSimulatedXmtpChat({
  xmtpClient,
  agentAddress = AGENT_ADDRESS,
}: {
  xmtpClient: Client | null;
  agentAddress?: string;
}) {
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);
  const conversationRef = useRef<Conversation | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: SimulatedMessage[] = JSON.parse(stored);
        setMessages(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist messages to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (!xmtpClient || !agentAddress) return;

    const startChat = async () => {
      const conversation = await xmtpClient.conversations.newConversation(
        agentAddress
      );
      conversationRef.current = conversation;

      const existing = await conversation.messages();
      const newMessages = existing.filter(
        (m) => !messages.find((msg) => msg.id === m.id)
      );
      if (newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages]);
      }

      for await (const msg of await conversation.streamMessages()) {
        if (msg.senderAddress !== agentAddress) {
          setMessages((prev) => [...prev, msg]);
          handleUserMessage(msg.content);
        }
      }
    };

    const handleUserMessage = async (content: string) => {
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
      const fakeMessage: SimulatedMessage = {
        content,
        sent: new Date(),
        senderAddress: agentAddress,
        isSimulated: true,
      } as SimulatedMessage;

      setTimeout(() => {
        setMessages((prev) => [...prev, fakeMessage]);
      }, 500);
    };

    startChat();
  }, [xmtpClient, agentAddress]);

  return { messages };
}
