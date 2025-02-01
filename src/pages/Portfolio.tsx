import { useState, Suspense } from "react";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import PortfolioMetrics from "@/components/portfolio/PortfolioMetrics";
import PortfolioChart from "@/components/portfolio/PortfolioChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cryptoCurrencies } from "@/types/currency";
import { Skeleton } from "@/components/ui/skeleton";

const Portfolio = () => {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <NavigationHeader title="Portfolio Analytics" />
        
        <div className="flex justify-end mb-6">
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