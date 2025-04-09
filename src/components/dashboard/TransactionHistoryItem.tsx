import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Fee, Recipient, TxIds } from "@/lib/redux/slices/transactionSlice";
import { formatTimestamp, formatCryptoValue, estimateFiatValue } from "@/lib/utils";
import { useAppSelector } from "@/lib/redux/hooks";
import { motion } from "framer-motion";

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
    fee: Fee[] | Fee | null | undefined;
    status: "INPROGRESS" | "CONFIRMED" | "SETTLED" | "CANCELLED";
    timestamp: bigint;
    updatedAt: bigint;
    ids: TxIds | string;
  };
  showBalance: boolean;
  onExpand?: () => void;
};

const TransactionHistoryItem = ({
  transaction,
  showBalance,
  onExpand,
}: TransactionHistoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { prices } = useAppSelector((state) => state.price);
  
  const auth = useAppSelector((state) => state.auth);
  const userCurrency = auth.user?.currency || auth.merchant?.currency || "USD";

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

  const safeRecipient = transaction.recipient && transaction.recipient.length > 0 ? 
    transaction.recipient[0] : { address: 'Unknown' };
  
  const getSafeAddress = (address: string | undefined | null, length = 12) => {
    if (!address) return "Unknown";
    try {
      return `${address.slice(0, length)}${address.length > length ? '...' : ''}`;
    } catch (error) {
      console.error("Error formatting address:", error);
      return "Invalid address";
    }
  };

  const safeFormatTimestamp = (timestamp: bigint | null | undefined) => {
    if (!timestamp) return "Unknown date";
    try {
      return formatTimestamp(timestamp);
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
  };
  
  const isCryptoCurrency = (currency: string) => {
    return ['BTC', 'ETH', 'LTC', 'CELO'].includes(currency);
  };
  
  const bothCrypto = isCryptoCurrency(transaction.grossCurrency) && isCryptoCurrency(transaction.netCurrency);
  
  const fiatEquivalent = isCryptoCurrency(transaction.grossCurrency) 
    ? estimateFiatValue(transaction.grossValue, transaction.grossCurrency, userCurrency, 
        prices.reduce((acc, price) => {
          acc[`${price.currency}-${userCurrency}`] = parseFloat(price.value);
          return acc;
        }, {} as Record<string, number>)
      )
    : "";

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (onExpand && !isExpanded) {
      onExpand();
    }
  };

  const renderFees = () => {
    if (!transaction.fee) {
      return null;
    }
    
    if (Array.isArray(transaction.fee)) {
      return transaction.fee.map((fee, index) => (
        <div key={index} className="flex justify-between">
          <span>Network Fee:</span>
          <span>{fee.crypto ? formatCryptoValue(fee.crypto) : '0'} {transaction.grossCurrency}</span>
        </div>
      ));
    }
    
    return (
      <div className="flex justify-between">
        <span>Network Fee:</span>
        <span>
          {transaction.fee.crypto ? formatCryptoValue(transaction.fee.crypto) : '0'} {transaction.grossCurrency}
        </span>
      </div>
    );
  };

  return (
    <div className="group transition-all duration-200">
      <div 
        className={`flex items-center justify-between p-3 hover:bg-gradient-to-r ${colors.gradient} rounded-lg cursor-pointer`}
        onClick={toggleExpand}
      >
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
                ? `To: ${getSafeAddress(safeRecipient.address)}`
                : `From: ${getSafeAddress(transaction.sender)}`}
            </span>
          </div>
        </div>

        <div className={`text-right ${!showBalance ? "blur-content" : ""}`}>
          <div className={`font-medium ${isOutgoing ? "text-red-400" : "text-green-500"}`}>
            {isOutgoing ? "-" : "+"}{formatCryptoValue(transaction.grossValue)} {transaction.grossCurrency}
          </div>
          {fiatEquivalent && (
            <div className="text-xs text-gray-500 font-medium">
              ≈ {fiatEquivalent}
            </div>
          )}
          <div className="text-xs text-gray-400">
            {safeFormatTimestamp(transaction.timestamp)}
          </div>
        </div>
      </div>

      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 py-3 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-b-lg -mt-1"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 text-xs">Transaction ID:</span>
              <p className="font-medium text-white/90 bg-black/20 p-1 rounded mt-1 overflow-x-auto break-all">
                #{transaction.txId}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Date & Time:</span>
              <p className="font-medium text-blue-200 mt-1">
                {safeFormatTimestamp(transaction.timestamp)}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">
                {isOutgoing ? "Recipient" : "Sender"}:
              </span>
              <p className="font-medium break-all text-white/90 bg-black/20 p-1 rounded mt-1 overflow-x-auto">
                {isOutgoing
                  ? safeRecipient.address || "Unknown"
                  : transaction.sender || "Unknown"}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Status:</span>
              <p className={`font-medium ${getStatusColor(transaction.status)} mt-1`}>
                {transaction.status === "INPROGRESS" 
                  ? "In Progress" 
                  : transaction.status === "CONFIRMED" || transaction.status === "SETTLED" 
                  ? "Completed" 
                  : "Cancelled"}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Gross Amount:</span>
              <p className={`font-medium ${isOutgoing ? "text-red-400" : "text-green-500"} mt-1`}>
                {isOutgoing ? "-" : "+"}{formatCryptoValue(transaction.grossValue)} {transaction.grossCurrency}
                {fiatEquivalent && (
                  <span className="text-xs text-gray-300 ml-2">
                    ≈ {fiatEquivalent}
                  </span>
                )}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Net Amount:</span>
              <p className="font-medium text-purple-300 mt-1">
                {formatCryptoValue(transaction.netValue)} {transaction.netCurrency}
              </p>
            </div>
            {transaction.fee && (
              <div className="col-span-2">
                <span className="text-gray-400 text-xs">Fees:</span>
                <div className="mt-1 font-medium text-orange-300">
                  {renderFees()}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TransactionHistoryItem;
