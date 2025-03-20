import { useState, useEffect } from "react";
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
import { useAppSelector } from "@/lib/redux/hooks";
import { ApiService } from "@/lib/services";

const TransactionHistory = ({ showBalance, setShowBalance }) => {
  const [sortBy, setSortBy] = useState("date");
  const [filterCurrency, setFilterCurrency] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const { transactions } = useAppSelector((state) => state.transaction);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        await ApiService.getTransactionHistory();
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // fetchTransactions();
  }, []);

  // Filter transactions based on selected currency
  const filteredTransactions = transactions.filter((tx) =>
    filterCurrency === "all" ? true : tx.grossCurrency === filterCurrency
  );

  // Sort transactions based on selected sort method
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "date") {
      return (
        new Date(Number(b.timestamp)).getTime() -
        new Date(Number(a.timestamp)).getTime()
      );
    } else if (sortBy === "amount") {
      const aValue = parseFloat(a.grossValue.replace(/[^0-9.-]+/g, ""));
      const bValue = parseFloat(b.grossValue.replace(/[^0-9.-]+/g, ""));
      return bValue - aValue;
    }
    return 0;
  });

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

      {isLoading ? (
        <div className="py-20 text-center text-gray-500">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading transactions...</p>
        </div>
      ) : sortedTransactions.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <p>No transactions to display</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTransactions.map((tx) => (
            <TransactionHistoryItem
              key={tx.txId}
              transaction={tx}
              showBalance={showBalance}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default TransactionHistory;
