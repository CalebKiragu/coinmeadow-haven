import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const transactions = [
  {
    id: 1,
    type: "send",
    amount: "-0.5 BTC",
    value: "-$20,123.45",
    to: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    date: "2024-02-20",
  },
  {
    id: 2,
    type: "receive",
    amount: "+1.2 ETH",
    value: "+$2,856.12",
    from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    date: "2024-02-19",
  },
];

const TransactionHistory = () => {
  return (
    <GlassCard className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 hover:bg-white/50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`p-2 rounded-full ${
                  tx.type === "send"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {tx.type === "send" ? (
                  <ArrowUpRight size={20} />
                ) : (
                  <ArrowDownLeft size={20} />
                )}
              </div>
              <div>
                <div className="font-medium">
                  {tx.type === "send" ? "Sent" : "Received"}
                </div>
                <div className="text-sm text-gray-600">
                  {tx.type === "send" ? `To: ${tx.to}` : `From: ${tx.from}`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{tx.amount}</div>
              <div className="text-sm text-gray-600">{tx.value}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default TransactionHistory;