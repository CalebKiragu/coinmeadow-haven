
import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Fee, Recipient, TxIds } from "@/lib/redux/slices/transactionSlice";
import { formatTimestamp } from "@/lib/utils";

type TransactionHistoryItemProps = {
  transaction: {
    type: "SEND" | "RECEIVE" | "DEPOSIT" | "WITHDRAW" | "BCWITHDRAW";
    userId: string;
    sender: string;
    recipient: Recipient[];
    txId: string;
    inOut: string;
    grossValue: string;
    grossCurrency: string;
    netValue: string;
    netCurrency: string;
    fee: Fee[];
    status: "INPROGRESS" | "CONFIRMED" | "SETTLED" | "CANCELLED";
    timestamp: bigint;
    updatedAt: bigint;
    ids: TxIds | string;
  };
  showBalance: boolean;
};

const TransactionHistoryItem = ({
  transaction,
  showBalance,
}: TransactionHistoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="group transition-all duration-200"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer">
        <div className="flex items-center space-x-3">
          <div
            className={`p-1.5 rounded-full ${
              transaction.type === "SEND" || transaction.type === "WITHDRAW" || transaction.type === "BCWITHDRAW"
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {transaction.type === "SEND" || transaction.type === "WITHDRAW" || transaction.type === "BCWITHDRAW" ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownLeft size={16} />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="font-medium">
              {transaction.type === "SEND" 
                ? "Sent" 
                : transaction.type === "WITHDRAW" 
                ? "Withdrew" 
                : transaction.type === "BCWITHDRAW" 
                ? "Withdrew (Blockchain)" 
                : "Received"}
            </span>
            <span className="text-sm text-gray-500">
              {transaction.type === "SEND" || transaction.type === "WITHDRAW" || transaction.type === "BCWITHDRAW"
                ? `To: ${transaction.recipient[0]?.address?.slice(0, 12) || "Unknown"}...`
                : `From: ${transaction.sender?.slice(0, 12) || "Unknown"}...`}
            </span>
          </div>
        </div>

        <div className={`text-right ${!showBalance ? "blur-content" : ""}`}>
          <div className="font-medium">{transaction.grossValue}</div>
          <div className="text-sm text-gray-500">{transaction.netValue}</div>
          <div className="text-xs text-gray-400">
            {formatTimestamp(transaction.timestamp)}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 py-3 bg-white/5 rounded-b-lg -mt-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Transaction ID:</span>
              <p className="font-medium">#{transaction.txId}</p>
            </div>
            <div>
              <span className="text-gray-500">Currency:</span>
              <p className="font-medium">{transaction.grossCurrency}</p>
            </div>
            <div>
              <span className="text-gray-500">
                {transaction.type === "SEND" || transaction.type === "WITHDRAW" || transaction.type === "BCWITHDRAW" ? "Recipient" : "Sender"}:
              </span>
              <p className="font-medium break-all">
                {transaction.type === "SEND" || transaction.type === "WITHDRAW" || transaction.type === "BCWITHDRAW"
                  ? transaction.recipient[0]?.address || "Unknown"
                  : transaction.sender || "Unknown"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <p className={`font-medium ${
                transaction.status === "CONFIRMED" || transaction.status === "SETTLED" 
                  ? "text-green-500" 
                  : transaction.status === "CANCELLED" 
                  ? "text-red-500" 
                  : "text-yellow-500"
              }`}>
                {transaction.status === "INPROGRESS" 
                  ? "In Progress" 
                  : transaction.status === "CONFIRMED" || transaction.status === "SETTLED" 
                  ? "Completed" 
                  : "Cancelled"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryItem;
