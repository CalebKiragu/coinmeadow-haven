import { useState, useEffect, useMemo } from "react";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  SortAsc,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction } from "@/lib/redux/slices/transactionSlice";
import { ApiService } from "@/lib/services";
import TransactionHistoryItem from "@/components/dashboard/TransactionHistoryItem";
import { motion, AnimatePresence } from "framer-motion";
import { usePasskeyAuth } from "@/hooks/usePasskeyAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { setShowBalance } from "@/lib/redux/slices/walletSlice";

const History = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { transactions, isLoading } = useAppSelector(
    (state) => state.transaction
  );
  const { toast } = useToast();
  const { verifyPasskey, isPasskeyVerified, isVerifying } = usePasskeyAuth();

  const [date, setDate] = useState<Date | undefined>();
  const [transactionType, setTransactionType] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Get the global showBalance state from the wallet slice
  const { showBalance } = useAppSelector((state) => state.wallet);

  // Check for passkey verification when the component mounts
  useEffect(() => {
    const checkPasskeyVerification = async () => {
      if (!isPasskeyVerified) {
        try {
          const verified = await verifyPasskey();
          dispatch(setShowBalance(true));
          if (!verified) {
            // Redirect if authentication fails
            // navigate("/dashboard");
          }
        } catch (error) {
          toast({
            title: "Authentication Required",
            description:
              "Please verify your identity to view transaction details",
            variant: "default",
          });

          // Redirect if authentication fails
          navigate("/dashboard");
        }
      }
    };

    checkPasskeyVerification();
  }, [isPasskeyVerified, verifyPasskey, toast, navigate]);

  // Memoize transactions fetching to prevent unnecessary requests
  useEffect(() => {
    const fetchTransactions = async () => {
      // Check if we already have transactions
      if (transactions.length > 0) {
        console.log("History: Using cached transactions");
        return;
      }

      try {
        await ApiService.getTransactionHistory();
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Error",
          description: "Failed to load transaction history",
          variant: "destructive",
        });
      }
    };

    // fetchTransactions();
  }, [transactions.length, dispatch, toast]);

  // Memoize filtered transactions for better performance
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter by transaction type
      if (transactionType !== "all" && tx.type !== transactionType) {
        return false;
      }

      // Filter by currency - check both grossCurrency and currencies in inOut field
      if (currency !== "all") {
        // Check grossCurrency
        if (tx.grossCurrency !== currency) {
          // If grossCurrency doesn't match, check inOut field
          if (tx.inOut) {
            // Split inOut by dash to check for currencies
            const currencies = tx.inOut.split("-");
            // If none of the currencies match, filter out this transaction
            if (!currencies.some((c) => c.trim() === currency)) {
              return false;
            }
          } else {
            return false;
          }
        }
      }

      // Filter by status
      if (status !== "all") {
        const txStatus = tx.status.toLowerCase();
        if (
          (status === "pending" && txStatus !== "inprogress") ||
          (status === "completed" &&
            txStatus !== "confirmed" &&
            txStatus !== "settled") ||
          (status === "failed" && txStatus !== "cancelled")
        ) {
          return false;
        }
      }

      // Filter by date if selected
      if (date) {
        try {
          const txDate = new Date(Number(tx.timestamp));
          const selectedDate = new Date(date);
          if (
            txDate.getDate() !== selectedDate.getDate() ||
            txDate.getMonth() !== selectedDate.getMonth() ||
            txDate.getFullYear() !== selectedDate.getFullYear()
          ) {
            return false;
          }
        } catch (error) {
          console.error("Error comparing dates:", error);
          return false;
        }
      }

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        // Search in transaction ID, recipient address, or sender
        const recipientAddresses =
          tx.recipient && tx.recipient.length > 0
            ? tx.recipient
                .map((r) => r.address)
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
            : "";

        return (
          tx.txId.toLowerCase().includes(searchLower) ||
          recipientAddresses.includes(searchLower) ||
          (tx.sender && tx.sender.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [transactions, transactionType, currency, status, date, searchTerm]);

  // Sort the filtered transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return Number(b.timestamp) - Number(a.timestamp);
        case "oldest":
          return Number(a.timestamp) - Number(b.timestamp);
        case "highest":
          // Handle scientific notation
          const parseAmount = (val: string) => {
            try {
              if (val.includes("e")) {
                const [base, exponent] = val.split("e");
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
        case "lowest":
          const aVal = parseAmount(a.grossValue);
          const bVal = parseAmount(b.grossValue);
          return aVal - bVal;
        default:
          return Number(b.timestamp) - Number(a.timestamp);
      }
    });
  }, [filteredTransactions, sortBy]);

  // Group sorted transactions by status for the tabs
  const pendingTransactions = useMemo(
    () => sortedTransactions.filter((tx) => tx.status === "INPROGRESS"),
    [sortedTransactions]
  );

  const completedTransactions = useMemo(
    () =>
      sortedTransactions.filter(
        (tx) => tx.status === "CONFIRMED" || tx.status === "SETTLED"
      ),
    [sortedTransactions]
  );

  const failedTransactions = useMemo(
    () => sortedTransactions.filter((tx) => tx.status === "CANCELLED"),
    [sortedTransactions]
  );

  const handleExpandTransaction = (txId: string) => {
    setExpandedTxId((prevId) => (prevId === txId ? null : txId));
  };

  const clearFilters = () => {
    setTransactionType("all");
    setCurrency("all");
    setStatus("all");
    setDate(undefined);
    setSearchTerm("");
    setSortBy("newest");
  };

  const renderTransactionList = (transactions: Transaction[]) => {
    if (transactions.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No transactions found
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <AnimatePresence>
          {transactions.map((tx) => (
            <motion.div
              key={tx.txId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TransactionHistoryItem
                transaction={tx}
                showBalance={showBalance}
                onExpand={() => handleExpandTransaction(tx.txId)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  const renderSkeletonLoader = () => {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3 bg-white/10 rounded-lg flex justify-between items-center"
          >
            <div className="flex flex-col gap-2 w-2/3">
              <Skeleton height="h-4" width="w-full" />
              <Skeleton height="h-3" width="w-1/2" />
            </div>
            <div className="text-right w-1/3">
              <Skeleton height="h-4" width="w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen max-w-full mx-auto overflow-x-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 md:p-8">
      <NavigationHeader title="Transaction History" />

      <div className="space-y-6">
        {/* Improved mobile layout - 2 columns on mobile, more rows */}
        <div
          className={`grid ${
            isMobile ? "grid-cols-2" : "flex flex-wrap"
          } gap-4`}
        >
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger
              className={`${
                isMobile ? "w-full" : "w-[180px]"
              } bg-white dark:bg-gray-800`}
            >
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="SEND">Send</SelectItem>
              <SelectItem value="RECEIVE">Receive</SelectItem>
              <SelectItem value="DEPOSIT">Deposit</SelectItem>
              <SelectItem value="WITHDRAW">Withdraw</SelectItem>
              <SelectItem value="BCWITHDRAW">Blockchain Withdraw</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger
              className={`${
                isMobile ? "w-full" : "w-[180px]"
              } bg-white dark:bg-gray-800`}
            >
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="BTC">Bitcoin</SelectItem>
              <SelectItem value="ETH">Ethereum</SelectItem>
              <SelectItem value="LTC">Litecoin</SelectItem>
              <SelectItem value="CELO">Celo</SelectItem>
              <SelectItem value="USD">US Dollar</SelectItem>
              <SelectItem value="EUR">Euro</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger
              className={`${
                isMobile ? "w-full" : "w-[180px]"
              } bg-white dark:bg-gray-800`}
            >
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Amount</SelectItem>
              <SelectItem value="lowest">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  `${
                    isMobile ? "w-full" : "w-[180px]"
                  } justify-start text-left font-normal bg-white dark:bg-gray-800`,
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Clear filters button, full width on mobile */}
          {(transactionType !== "all" ||
            currency !== "all" ||
            date ||
            searchTerm) && (
            <Button
              variant="outline"
              className={`${
                isMobile ? "col-span-2" : ""
              } shrink-0 bg-white dark:bg-gray-800`}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}

          {/* Search input, full width on mobile, in its own row */}
          <div
            className={`relative ${isMobile ? "col-span-2" : "w-auto flex-1"}`}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              className="w-full pl-10 bg-white dark:bg-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="glass-effect rounded-lg p-6">
          <Tabs
            defaultValue="all"
            value={status}
            onValueChange={setStatus}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="space-y-4">{renderSkeletonLoader()}</div>
            ) : (
              <>
                <TabsContent value="all" className="space-y-4">
                  {renderTransactionList(sortedTransactions)}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                  {renderTransactionList(pendingTransactions)}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  {renderTransactionList(completedTransactions)}
                </TabsContent>

                <TabsContent value="failed" className="space-y-4">
                  {renderTransactionList(failedTransactions)}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default History;
