export type ParsedCommand =
  | { type: "help" }
  | { type: "balance" }
  | {
      type: "send" | "transfer" | "pay";
      amount: number;
      currency: string;
      recipient: string;
    }
  | {
      type: "request";
      amount: number;
      currency: string;
      sender: string;
    };

export function parseMessage(message: string): ParsedCommand | null {
  const text = message.trim().toLowerCase();

  if (text === "help") {
    return { type: "help" };
  }

  if (/^(check )?balance$/.test(text)) {
    return { type: "balance" };
  }

  const sendRegex =
    /^(send|transfer|pay)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+to\s+(.+)$/;
  const requestRegex =
    /^request\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+from\s+(.+)$/;

  const sendMatch = text.match(sendRegex);
  if (sendMatch) {
    const [, type, amt, curr, recipient] = sendMatch;
    return {
      type: type as "send" | "transfer" | "pay",
      amount: parseFloat(amt),
      currency: curr.toLowerCase(),
      recipient: recipient.trim(),
    };
  }

  const requestMatch = text.match(requestRegex);
  if (requestMatch) {
    const [, amt, curr, sender] = requestMatch;
    return {
      type: "request",
      amount: parseFloat(amt),
      currency: curr.toLowerCase(),
      sender: sender.trim(),
    };
  }

  return null; // not recognized
}
