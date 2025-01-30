import { useState } from "react";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PortfolioMetrics from "@/components/portfolio/PortfolioMetrics";
import PortfolioChart from "@/components/portfolio/PortfolioChart";
import { cryptoCurrencies } from "@/types/currency";

const Portfolio = () => {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <NavigationHeader title="Portfolio" />
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Market Overview</h1>
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select currency" />
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

        <div className="grid gap-6">
          <PortfolioMetrics selectedCrypto={selectedCrypto} />
          <PortfolioChart selectedCrypto={selectedCrypto} />
        </div>
      </div>
    </div>
  );
};

export default Portfolio;