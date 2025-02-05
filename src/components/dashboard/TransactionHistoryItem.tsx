import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

type TransactionHistoryItemProps = {
  transaction: {
    id: number;
    type: "send" | "receive";
    amount: string;
    value: string;
    to?: string;
    from?: string;
    date: string;
    currency: string;
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
              transaction.type === "send"
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {transaction.type === "send" ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownLeft size={16} />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="font-medium">
              {transaction.type === "send" ? "Sent" : "Received"}
            </span>
            <span className="text-sm text-gray-500">
              {transaction.type === "send"
                ? `To: ${transaction.to?.slice(0, 12)}...`
                : `From: ${transaction.from?.slice(0, 12)}...`}
            </span>
          </div>
        </div>

        <div className={`text-right ${!showBalance ? "blur-content" : ""}`}>
          <div className="font-medium">{transaction.amount}</div>
          <div className="text-sm text-gray-500">{transaction.value}</div>
          <div className="text-xs text-gray-400">{transaction.date}</div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 py-3 bg-white/5 rounded-b-lg -mt-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Transaction ID:</span>
              <p className="font-medium">#{transaction.id}</p>
            </div>
            <div>
              <span className="text-gray-500">Currency:</span>
              <p className="font-medium">{transaction.currency}</p>
            </div>
            <div>
              <span className="text-gray-500">
                {transaction.type === "send" ? "Recipient" : "Sender"}:
              </span>
              <p className="font-medium break-all">
                {transaction.type === "send"
                  ? transaction.to
                  : transaction.from}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <p className="font-medium text-green-500">Completed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryItem;