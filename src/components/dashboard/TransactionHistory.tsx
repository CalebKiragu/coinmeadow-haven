import { useState } from "react";
import { Calendar, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GlassCard from "../ui/GlassCard";
import TransactionHistoryItem from "./TransactionHistoryItem";

type Transaction = {
  id: number;
  type: "send" | "receive";
  amount: string;
  value: string;
  to?: string;
  from?: string;
  date: string;
  currency: string;
};

const transactions: Transaction[] = [
  {
    id: 1,
    type: "send",
    amount: "-0.5 BTC",
    value: "-$20,123.45",
    to: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    date: "2024-02-20",
    currency: "BTC",
  },
  {
    id: 2,
    type: "receive",
    amount: "+1.2 ETH",
    value: "+$2,856.12",
    from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    date: "2024-02-19",
    currency: "ETH",
  },
];

const TransactionHistory = ({ showBalance, setShowBalance }) => {
  const [sortBy, setSortBy] = useState("date");
  const [filterCurrency, setFilterCurrency] = useState("all");

  const filteredTransactions = transactions.filter((tx) =>
    filterCurrency === "all" ? true : tx.currency === filterCurrency
  );

  return (
    <GlassCard className="animate-fade-in">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={filterCurrency} onValueChange={setFilterCurrency}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="BTC">Bitcoin</SelectItem>
              <SelectItem value="ETH">Ethereum</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        {filteredTransactions.map((tx) => (
          <TransactionHistoryItem
            key={tx.id}
            transaction={tx}
            showBalance={showBalance}
          />
        ))}
      </div>
    </GlassCard>
  );
};

export default TransactionHistory;