
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

  // Function to get transaction type color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "SEND":
        return { bg: "bg-red-100/80", text: "text-red-600", iconBg: "bg-red-500/10", gradient: "from-red-500/10 to-red-600/5" };
      case "WITHDRAW":
      case "BCWITHDRAW":
        return { bg: "bg-orange-100/80", text: "text-orange-600", iconBg: "bg-orange-500/10", gradient: "from-orange-500/10 to-orange-600/5" };
      case "RECEIVE":
        return { bg: "bg-green-100/80", text: "text-green-600", iconBg: "bg-green-500/10", gradient: "from-green-500/10 to-green-600/5" };
      case "DEPOSIT":
        return { bg: "bg-purple-100/80", text: "text-purple-600", iconBg: "bg-purple-500/10", gradient: "from-purple-500/10 to-purple-600/5" };
      default:
        return { bg: "bg-blue-100/80", text: "text-blue-600", iconBg: "bg-blue-500/10", gradient: "from-blue-500/10 to-blue-600/5" };
    }
  };

  // Function to get transaction status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "SETTLED":
        return "text-emerald-500";
      case "CANCELLED":
        return "text-red-500";
      case "INPROGRESS":
        return "text-amber-500";
      default:
        return "text-gray-500";
    }
  };

  const colors = getTransactionTypeColor(transaction.type);
  const isOutgoing = transaction.type === "SEND" || transaction.type === "WITHDRAW" || transaction.type === "BCWITHDRAW";

  return (
    <div
      className="group transition-all duration-200"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className={`flex items-center justify-between p-3 hover:bg-gradient-to-r ${colors.gradient} rounded-lg cursor-pointer`}>
        <div className="flex items-center space-x-3">
          <div
            className={`p-1.5 rounded-full ${colors.bg} ${colors.text}`}
          >
            {isOutgoing ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownLeft size={16} />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className={`font-medium ${colors.text}`}>
              {transaction.type === "SEND" 
                ? "Sent" 
                : transaction.type === "WITHDRAW" 
                ? "Withdrew" 
                : transaction.type === "BCWITHDRAW" 
                ? "Withdrew (Blockchain)" 
                : transaction.type === "DEPOSIT"
                ? "Deposited"
                : "Received"}
            </span>
            <span className="text-sm text-gray-500">
              {isOutgoing
                ? `To: ${transaction.recipient[0]?.address?.slice(0, 12) || "Unknown"}...`
                : `From: ${transaction.sender?.slice(0, 12) || "Unknown"}...`}
            </span>
          </div>
        </div>

        <div className={`text-right ${!showBalance ? "blur-content" : ""}`}>
          <div className={`font-medium ${isOutgoing ? "text-red-400" : "text-green-500"}`}>
            {isOutgoing ? "-" : "+"}{transaction.grossValue} {transaction.grossCurrency}
          </div>
          <div className="text-sm text-gray-500">{transaction.netValue} {transaction.netCurrency}</div>
          <div className="text-xs text-gray-400">
            {formatTimestamp(transaction.timestamp)}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 py-3 bg-gradient-to-r from-white/5 to-white/10 rounded-b-lg -mt-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Transaction ID:</span>
              <p className="font-medium text-white/90">#{transaction.txId}</p>
            </div>
            <div>
              <span className="text-gray-400">Currency:</span>
              <p className="font-medium text-white/90">{transaction.grossCurrency}</p>
            </div>
            <div>
              <span className="text-gray-400">
                {isOutgoing ? "Recipient" : "Sender"}:
              </span>
              <p className="font-medium break-all text-white/90">
                {isOutgoing
                  ? transaction.recipient[0]?.address || "Unknown"
                  : transaction.sender || "Unknown"}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <p className={`font-medium ${getStatusColor(transaction.status)}`}>
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
