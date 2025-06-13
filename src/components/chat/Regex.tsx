export type ParsedCommand =
  | { type: "help" }
  | { type: "balance" }
  | { type: "chain" }
  | {
      type: "send" | "transfer" | "pay";
      amount: number;
      currency: string;
      testnet: boolean;
      recipient: string;
    }
  | {
      type: "request";
      amount: number;
      currency: string;
      testnet: boolean;
      sender: string;
    };

export function parseMessage(message: string): ParsedCommand | null {
  const text = message.trim().toLowerCase();

  if (text === "help") {
    return { type: "help" };
  }

  if (/\bbalance\b/i.test(text)) {
    return { type: "balance" };
  }

  if (/^chain( id)?$/i.test(text)) {
    return { type: "chain" };
  }

  const sendRegex =
    /^(send|transfer|pay)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)(?:\s+(mainnet|sepolia))?\s+to\s+(.+)$/;
  const requestRegex =
    /^request\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)(?:\s+(mainnet|sepolia))?\s+from\s+(.+)$/;

  const sendMatch = text.match(sendRegex);
  if (sendMatch) {
    const [, type, amt, curr, sepolia, recipient] = sendMatch;
    return {
      type: type as "send" | "transfer" | "pay",
      amount: parseFloat(amt),
      currency: curr.toLowerCase(),
      testnet: sepolia?.toLowerCase() === "sepolia" || false,
      recipient: recipient.trim(),
    };
  }

  const requestMatch = text.match(requestRegex);
  if (requestMatch) {
    const [, amt, curr, sepolia, sender] = requestMatch;
    return {
      type: "request",
      amount: parseFloat(amt),
      currency: curr.toLowerCase(),
      testnet: sepolia?.toLowerCase() === "sepolia" || false,
      sender: sender.trim(),
    };
  }

  return null; // not recognized
}
