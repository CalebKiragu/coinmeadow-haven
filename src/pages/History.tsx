
import { useState, useEffect } from "react";
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
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction } from "@/lib/redux/slices/transactionSlice";
import { ApiService } from "@/lib/services";

const History = () => {
  const dispatch = useAppDispatch();
  const { transactions, isLoading } = useAppSelector((state) => state.transaction);
  
  const [date, setDate] = useState<Date | undefined>();
  const [transactionType, setTransactionType] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    // Fetch transaction history when component mounts
    const fetchTransactions = async () => {
      try {
        await ApiService.getTransactionHistory();
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    
    fetchTransactions();
  }, [dispatch]);

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter((tx) => {
    // Filter by transaction type
    if (transactionType !== "all" && tx.type !== transactionType) {
      return false;
    }
    
    // Filter by currency
    if (currency !== "all" && tx.grossCurrency !== currency) {
      return false;
    }
    
    // Filter by status
    if (status !== "all") {
      const txStatus = tx.status.toLowerCase();
      if (
        (status === "pending" && txStatus !== "inprogress") ||
        (status === "completed" && (txStatus !== "confirmed" && txStatus !== "settled")) ||
        (status === "failed" && txStatus !== "cancelled")
      ) {
        return false;
      }
    }
    
    // Filter by date if selected
    if (date) {
      const txDate = new Date(Number(tx.timestamp));
      const selectedDate = new Date(date);
      if (
        txDate.getDate() !== selectedDate.getDate() ||
        txDate.getMonth() !== selectedDate.getMonth() ||
        txDate.getFullYear() !== selectedDate.getFullYear()
      ) {
        return false;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      // Search in transaction ID, recipient address, or sender
      const recipientAddresses = tx.recipient && tx.recipient.length > 0 
        ? tx.recipient.map(r => r.address).filter(Boolean).join(' ').toLowerCase()
        : '';
      
      return (
        tx.txId.toLowerCase().includes(searchLower) ||
        recipientAddresses.includes(searchLower) ||
        (tx.sender && tx.sender.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Group transactions by status
  const pendingTransactions = filteredTransactions.filter(
    (tx) => tx.status === "INPROGRESS"
  );
  const completedTransactions = filteredTransactions.filter(
    (tx) => tx.status === "CONFIRMED" || tx.status === "SETTLED"
  );
  const failedTransactions = filteredTransactions.filter(
    (tx) => tx.status === "CANCELLED"
  );

  // Render transaction item with proper null checking
  const renderTransactionItem = (tx: Transaction) => {
    const date = new Date(Number(tx.timestamp));
    const formattedDate = format(date, "MMM dd, yyyy HH:mm");
    const isReceive = tx.type === "RECEIVE";
    const isDeposit = tx.type === "DEPOSIT";
    
    // Safely get recipient address
    const recipientAddress = tx.recipient && tx.recipient.length > 0 && tx.recipient[0]?.address
      ? tx.recipient[0].address.substring(0, 10)
      : "Unknown";
    
    return (
      <div 
        key={tx.txId} 
        className="p-3 bg-white/10 rounded-lg flex justify-between items-center border border-white/5"
      >
        <div className="flex flex-col">
          <span className="font-medium">
            {tx.type} {isReceive || isDeposit ? "from" : "to"} {recipientAddress}...
          </span>
          <span className="text-xs text-gray-400">{formattedDate}</span>
        </div>
        <div className="text-right">
          <span className={`font-bold ${isReceive || isDeposit ? "text-green-500" : "text-red-400"}`}>
            {isReceive || isDeposit ? "+" : "-"}{tx.grossValue} {tx.grossCurrency}
          </span>
        </div>
      </div>
    );
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
        {transactions.map(renderTransactionItem)}
      </div>
    );
  };

  const renderSkeletonLoader = () => {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 bg-white/10 rounded-lg flex justify-between items-center">
            <div className="flex flex-col gap-2 w-2/3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="text-right w-1/3">
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <NavigationHeader title="Transaction History" />
        
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Select 
              defaultValue="all" 
              value={transactionType}
              onValueChange={setTransactionType}
            >
              <SelectTrigger className="w-[180px]">
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

            <Select 
              defaultValue="all"
              value={currency}
              onValueChange={setCurrency}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                <SelectItem value="BTC">Bitcoin</SelectItem>
                <SelectItem value="ETH">Ethereum</SelectItem>
                <SelectItem value="LTC">Litecoin</SelectItem>
                <SelectItem value="CELO">Celo</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[180px] justify-start text-left font-normal",
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

            <div className="relative w-full md:w-auto md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                className="w-full pl-10"
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
                <div className="space-y-4">
                  {renderSkeletonLoader()}
                </div>
              ) : (
                <>
                  <TabsContent value="all" className="space-y-4">
                    {renderTransactionList(filteredTransactions)}
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
    </div>
  );
};

export default History;
