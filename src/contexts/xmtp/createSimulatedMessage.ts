import { DecodedMessage } from "@xmtp/react-sdk";
import { ContentTypeText } from "@xmtp/content-type-text";

// Use this to generate unique IDs if needed
const generateId = () => Math.random().toString(36).slice(2);

export function createSimulatedMessage({
  content,
  sent,
  senderAddress,
  conversationId,
  recipientAddress,
}: {
  content: string;
  sent?: Date;
  senderAddress: string;
  conversationId: string;
  recipientAddress: string;
}): DecodedMessage<unknown> {
  const now = sent ?? new Date();

  // Fill in minimal fields required by DecodedMessage
  const simulatedMessage = {
    content,
    contentType: ContentTypeText,
    contentFallback: content,
    conversationId,
    senderAddress,
    recipientAddress,
    sent: now,
    id: `sim-${generateId()}`,
    hasLoadError: false,
    status: "delivered",
    // Optional: If your UI expects this
    isSimulated: true,
  } as unknown as DecodedMessage<unknown>;

  return simulatedMessage;
}
