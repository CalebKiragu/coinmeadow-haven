
import { useState, useEffect, useMemo } from "react";
import { Calendar, Filter, ChevronRight, Eye, EyeOff } from "lucide-react";
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
import { usePasskeyAuth } from "@/hooks/usePasskeyAuth";
import { useToast } from "@/hooks/use-toast";
import { setShowBalance, toggleShowBalance } from "@/lib/redux/slices/walletSlice";

const TransactionHistory = () => {
  const [sortBy, setSortBy] = useState("date");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { verifyPasskey, isPasskeyVerified, isVerifying } = usePasskeyAuth();

  const { transactions } = useAppSelector((state) => state.transaction);
  const { showBalance } = useAppSelector((state) => state.wallet);
  
  // Memoize transactions fetching to prevent unnecessary requests
  useEffect(() => {
    const fetchTransactions = async () => {
      // Always fetch transactions on mount or when forceRefresh is triggered
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
  }, [forceRefresh]);

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
        // Safely parse numeric values from strings that might be in scientific notation
        const parseAmount = (val: string) => {
          try {
            if (val.includes('e')) {
              const [base, exponent] = val.split('e');
              return parseFloat(base) * Math.pow(10, parseInt(exponent));
            }
            return parseFloat(val.replace(/[^0-9.-]+/g, ""));
          } catch (error) {
            console.error("Error parsing amount:", error);
            return 0;
          }
        };
        
        const aValue = parseAmount(a.grossValue);
        const bValue = parseAmount(b.grossValue);
        
        return bValue - aValue;
      }
      return 0;
    });
  }, [transactions, filterType, sortBy]);

  // Show only the most recent 3 transactions for dashboard
  const recentTransactions = filteredAndSortedTransactions.slice(0, 3);
  const hasMoreTransactions = filteredAndSortedTransactions.length > 3;

  const handleToggleBalance = async () => {
    // Prevent multiple simultaneous verification attempts
    if (isVerifying) return;
    
    // If we're trying to show the balance and passkey hasn't been verified yet
    if (!showBalance && !isPasskeyVerified) {
      try {
        const verified = await verifyPasskey();
        if (verified) {
          dispatch(setShowBalance(true));
        }
      } catch (error) {
        toast({
          title: "Authentication Failed",
          description: "Unable to verify your identity",
          variant: "destructive",
        });
      }
    } else {
      // Toggle the balance visibility state
      dispatch(toggleShowBalance());
    }
  };

  return (
    <GlassCard className="animate-fade-in">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleToggleBalance}
            className="flex items-center"
            disabled={isVerifying}
            aria-label={showBalance ? "Hide Balance" : "Show Balance"}
          >
            {showBalance ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
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
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setForceRefresh(!forceRefresh)}
          >
            Refresh Transactions
          </Button>
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
