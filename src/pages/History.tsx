import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Transaction = {
  id: number;
  type: "send" | "receive";
  amount: string;
  value: string;
  to?: string;
  from?: string;
  date: string;
  currency: string;
  status: "completed" | "pending" | "failed";
  hash: string;
  fee: string;
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
    status: "completed",
    hash: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    fee: "0.0001 BTC"
  },
  {
    id: 2,
    type: "receive",
    amount: "+1.2 ETH",
    value: "+$2,856.12",
    from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    date: "2024-02-19",
    currency: "ETH",
    status: "completed",
    hash: "0x842d35Cc6634C0532925a3b844Bc454e4438f44f",
    fee: "0.002 ETH"
  },
];

const History = () => {
  const [sortBy, setSortBy] = useState("date");
  const [filterCurrency, setFilterCurrency] = useState("all");

  const filteredTransactions = transactions.filter((tx) =>
    filterCurrency === "all" ? true : tx.currency === filterCurrency
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <div className="flex gap-4">
            <Select value={filterCurrency} onValueChange={setFilterCurrency}>
              <SelectTrigger className="w-[140px] glass-effect">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                <SelectItem value="BTC">Bitcoin</SelectItem>
                <SelectItem value="ETH">Ethereum</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] glass-effect">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {filteredTransactions.map((tx) => (
            <AccordionItem
              key={tx.id}
              value={`item-${tx.id}`}
              className="glass-effect rounded-lg overflow-hidden border-none"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
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
                      <div className="font-medium text-white">
                        {tx.type === "send" ? "Sent" : "Received"}
                      </div>
                      <div className="text-sm text-gray-200">{tx.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">{tx.amount}</div>
                    <div className="text-sm text-gray-200">{tx.value}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-2 text-white">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status</span>
                    <span className={`capitalize ${
                      tx.status === "completed" ? "text-green-400" : 
                      tx.status === "pending" ? "text-yellow-400" : "text-red-400"
                    }`}>{tx.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Transaction Hash</span>
                    <span className="text-sm font-mono">{tx.hash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Network Fee</span>
                    <span>{tx.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      {tx.type === "send" ? "Recipient" : "Sender"}
                    </span>
                    <span className="text-sm font-mono">
                      {tx.type === "send" ? tx.to : tx.from}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default History;