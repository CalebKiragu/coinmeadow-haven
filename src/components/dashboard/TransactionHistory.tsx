
import { useState, useEffect, useMemo } from "react";
import { Calendar, Filter, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button"; 
import GlassCard from "../ui/GlassCard";
import TransactionHistoryItem from "./TransactionHistoryItem";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { ApiService } from "@/lib/services";

const TransactionHistory = ({ showBalance, setShowBalance }) => {
  const [sortBy, setSortBy] = useState("date");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const { transactions } = useAppSelector((state) => state.transaction);
  
  // Memoize transactions fetching to prevent unnecessary requests
  useEffect(() => {
    const fetchTransactions = async () => {
      // Check if we already have transactions
      if (transactions.length > 0) {
        console.log("TransactionHistory: Using cached transactions");
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("TransactionHistory: Fetching transactions...");
        await ApiService.getTransactionHistory();
        console.log("TransactionHistory: Fetched transactions successfully");
      } catch (error) {
        console.error("TransactionHistory: Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [transactions.length]);

  // Memoize filtered and sorted transactions for performance
  const filteredAndSortedTransactions = useMemo(() => {
    // Filter transactions based on selected type
    const filtered = transactions.filter((tx) => {
      if (filterType === "all") return true;
      return tx.type === filterType;
    });

    // Sort transactions based on selected sort method
    return [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        return Number(b.timestamp) - Number(a.timestamp);
      } else if (sortBy === "amount") {
        const aValue = parseFloat(a.grossValue.replace(/[^0-9.-]+/g, ""));
        const bValue = parseFloat(b.grossValue.replace(/[^0-9.-]+/g, ""));
        return bValue - aValue;
      }
      return 0;
    });
  }, [transactions, filterType, sortBy]);

  // Show only the most recent 5 transactions for dashboard
  const recentTransactions = filteredAndSortedTransactions.slice(0, 5);
  const hasMoreTransactions = filteredAndSortedTransactions.length > 5;

  return (
    <GlassCard className="animate-fade-in">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SEND">Sent</SelectItem>
              <SelectItem value="RECEIVE">Received</SelectItem>
              <SelectItem value="DEPOSIT">Deposits</SelectItem>
              <SelectItem value="WITHDRAW">Withdrawals</SelectItem>
              <SelectItem value="BCWITHDRAW">Blockchain Withdrawals</SelectItem>
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
      ) : recentTransactions.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <p>No transactions to display</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <TransactionHistoryItem
                key={tx.txId}
                transaction={tx}
                showBalance={showBalance}
              />
            ))}
          </div>
          
          {hasMoreTransactions && (
            <div className="mt-4 text-center">
              <Link to="/history">
                <Button variant="ghost" className="text-primary hover:text-primary-dark group">
                  See All Transactions
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
};

export default TransactionHistory;
