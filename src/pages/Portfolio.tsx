import { useState, Suspense } from "react";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import PortfolioMetrics from "@/components/portfolio/PortfolioMetrics";
import PortfolioChart from "@/components/portfolio/PortfolioChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cryptoCurrencies } from "@/types/currency";
import { Skeleton } from "@/components/ui/skeleton";

const Portfolio = () => {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <NavigationHeader title="Portfolio" />

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button variant="secondary" className="bg-green-800">
              Buy
            </Button>
            <Button variant="secondary" className="bg-red-800">
              Sell
            </Button>
          </div>
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {cryptoCurrencies.map((crypto) => (
                <SelectItem key={crypto.symbol} value={crypto.symbol}>
                  {crypto.name} ({crypto.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <PortfolioMetrics selectedCrypto={selectedCrypto} />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <PortfolioChart selectedCrypto={selectedCrypto} />
        </Suspense>
      </div>
    </div>
  );
};

export default Portfolio;
