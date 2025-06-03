import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";
import { cryptoCurrencies } from "@/types/currency";

interface PortfolioMetricsProps {
  selectedCrypto: string;
}

interface MetricData {
  title: string;
  value: string;
  change: number;
  isIncrease: boolean;
  timeframe: string;
  source: string;
}

interface DataSourceMap {
  [key: string]: string;
}

const dataSources: DataSourceMap = {
  price: "CoinGecko",
  marketCap: "CoinMarketCap",
  volume: "Binance",
  supply: "TradingView",
};

const PortfolioMetrics = ({ selectedCrypto }: PortfolioMetricsProps) => {
  const [activeTimeframe, setActiveTimeframe] = useState<"24h" | "7d" | "30d">(
    "24h"
  );

  const { data: coinData, isLoading } = useQuery({
    queryKey: ["coinMetrics", selectedCrypto, activeTimeframe],
    queryFn: async () => {
      try {
        const id =
          cryptoCurrencies.find((c) => c.symbol === selectedCrypto)
            ?.coinGeckoId || "bitcoin";
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${id}?market_data=true`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching coin data:", error);
        return null;
      }
    },
    staleTime: 60000,
  });

  const metrics = useMemo<MetricData[]>(() => {
    if (!coinData) {
      return [
        {
          title: "Price",
          value: "$0.00",
          change: 0,
          isIncrease: false,
          timeframe: activeTimeframe,
          source: dataSources.price,
        },
        {
          title: "Market Cap",
          value: "$0.00",
          change: 0,
          isIncrease: false,
          timeframe: activeTimeframe,
          source: dataSources.marketCap,
        },
        {
          title: "24h Volume",
          value: "$0.00",
          change: 0,
          isIncrease: false,
          timeframe: activeTimeframe,
          source: dataSources.volume,
        },
        {
          title: "Circulating Supply",
          value: "0.00",
          change: 0,
          isIncrease: false,
          timeframe: activeTimeframe,
          source: dataSources.supply,
        },
      ];
    }

    // Extract relevant metrics from data
    const price = coinData.market_data?.current_price?.usd || 0;
    const priceChangeKey =
      `price_change_percentage_${activeTimeframe}` as keyof typeof coinData.market_data;
    const priceChange = coinData.market_data[priceChangeKey] || 0;

    const marketCap = coinData.market_data?.market_cap?.usd || 0;
    const marketCapChangeKey =
      `market_cap_change_percentage_${activeTimeframe}` as keyof typeof coinData.market_data;
    const marketCapChange = coinData.market_data[marketCapChangeKey] || 0;

    const volume = coinData.market_data?.total_volume?.usd || 0;
    // Volume change is not directly available, so we use a placeholder or calculate it if available
    const volumeChange = 0; // Placeholder

    const circulatingSupply = coinData.market_data?.circulating_supply || 0;
    const totalSupply = coinData.market_data?.total_supply || circulatingSupply;
    // Calculate the percentage of circulating supply compared to total
    const supplyPercentage = totalSupply
      ? (circulatingSupply / totalSupply) * 100
      : 0;

    return [
      {
        title: "Price",
        value: `$${price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: priceChange,
        isIncrease: priceChange > 0,
        timeframe: activeTimeframe,
        source: dataSources.price,
      },
      {
        title: "Market Cap",
        value: `$${marketCap.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}`,
        change: marketCapChange,
        isIncrease: marketCapChange > 0,
        timeframe: activeTimeframe,
        source: dataSources.marketCap,
      },
      {
        title: "24h Volume",
        value: `$${volume.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}`,
        change: volumeChange,
        isIncrease: volumeChange > 0,
        timeframe: activeTimeframe,
        source: dataSources.volume,
      },
      {
        title: "Circulating Supply",
        value: `${circulatingSupply.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })} ${selectedCrypto}`,
        change: supplyPercentage,
        isIncrease: true, // Always positive since it's a percentage of total
        timeframe: "total",
        source: dataSources.supply,
      },
    ];
  }, [coinData, activeTimeframe, selectedCrypto]);

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs
          defaultValue="24h"
          value={activeTimeframe}
          onValueChange={(v) => setActiveTimeframe(v as "24h" | "7d" | "30d")}
          className="mb-4"
        >
          <TabsList className="grid grid-cols-3 w-36">
            <TabsTrigger value="24h">24H</TabsTrigger>
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="30d">30D</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-secondary/30">
                    <Skeleton height="h-6" width="w-24" className="mb-2" />
                    <Skeleton height="h-8" width="w-32" className="mb-2" />
                    <Skeleton height="h-4" width="w-16" />
                  </div>
                ))
            : metrics.map((metric, i) => (
                <div key={i} className="p-4 rounded-lg bg-secondary/30">
                  <h3 className="text-sm text-muted-foreground mb-1">
                    {metric.title}
                  </h3>
                  <p className="text-xl font-bold">{metric.value}</p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`text-xs font-medium flex items-center ${
                        metric.isIncrease ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {metric.isIncrease ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(metric.change).toFixed(2)}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Source: {metric.source}
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioMetrics;
