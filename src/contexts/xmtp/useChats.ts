import { DecodedMessage } from "@xmtp/react-sdk";

//  Extract only serializable data from messages
export const extractSerializableMessage = (
  message: DecodedMessage
): DecodedMessage | any => {
  return {
    // Add simple properties as needed
    // Avoid complex objects like client instances, conversation objects, etc.
    id: message.id,
    messageVersion: message.messageVersion,
    senderAddress: message.senderAddress,
    recipientAddress: message.recipientAddress,
    sent: message.sent,
    contentTopic: message.contentTopic,
    contentType: message.contentType,
    content: message.content,
    error: message.error,
    contentBytes: message.contentBytes,
    contentFallback: message.contentFallback,
  };
};
