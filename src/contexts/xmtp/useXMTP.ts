import { useEffect, useState } from "react";
import {
  Client as XMTPClient,
  Conversation,
  DecodedMessage,
} from "@xmtp/xmtp-js";
// import { WalletClient } from "viem";
import { useWalletClient } from "wagmi";
import { getXMTPCompatibleSigner } from "./getXMTPCompatibleSigner";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setXMTPConfig } from "@/lib/redux/slices/web3Slice";

export function useXMTP() {
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [isXMTPConnected, setIsXMTPConnected] = useState(false);
  const [xmtpClient, setXmtpClient] = useState<XMTPClient | null>(null);
  const [xmtpLoading, setXMTPLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DecodedMessage[]>([]);

  const initXMTP = async () => {
    if (!walletClient) return;
    setXMTPLoading(true);
    const signer = getXMTPCompatibleSigner(walletClient);
    let xmtp;

    try {
      console.log("Wallet Address:", await signer.getAddress());
      xmtp = await XMTPClient.create(signer, { env: "production" });
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
    initXMTP();
  }, [walletClient]);

  useEffect(() => {
    if (conversation)
      dispatch(
        setXMTPConfig({
          xmtp: { peer: conversation?.peerAddress },
        })
      );
  }, [conversation]);

  const startConversation = async (peerAddress: string) => {
    if (!xmtpClient) {
      toast({
        title: "Wallet not detected",
        description: "Please sign your wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    const canMessage = await xmtpClient.canMessage(peerAddress);
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
      convo = await xmtpClient.conversations.newConversation(peerAddress);
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
    const msgs = await convo.messages();
    console.log("msgs >> ", msgs);
    setMessages(msgs);

    // Start streaming
    const streamMessages = async () => {
      const stream = await convo.streamMessages();
      try {
        for await (const msg of stream) {
          setMessages((prev) => {
            const alreadyExists = prev.some((m) => m.id === msg.id);
            return alreadyExists ? prev : [...prev, msg];
          });
        }
      } catch (err) {
        console.error("Stream error:", err);
      }
    };
    streamMessages();
  };

  const resetConversation = () => {
    setMessages([]);
    // dispatch(resetXMTPConfig());
    setConversation(null);
    initXMTP();
  };

  const sendMessage = async (text: string) => {
    if (!conversation) return;
    await conversation.send(text);
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
