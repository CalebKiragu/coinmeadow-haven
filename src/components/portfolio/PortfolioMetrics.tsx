
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface MetricsProps {
  selectedCrypto: string;
}

interface CryptoMetrics {
  marketCap: number;
  volume: number;
  dominance: number;
  performance: number;
}

const fetchCryptoMetrics = async (symbol: string): Promise<CryptoMetrics> => {
  try {
    // Use CoinGecko API to fetch real crypto data
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${getCoinGeckoId(symbol)}`);
    const data = response.data;
    
    return {
      marketCap: data.market_data.market_cap.usd || 0,
      volume: data.market_data.total_volume.usd || 0,
      dominance: data.market_data.market_cap_rank ? 100 / data.market_data.market_cap_rank : 0, // Approximated dominance based on rank
      performance: data.market_data.price_change_percentage_24h || 0
    };
  } catch (error) {
    console.error("Error fetching crypto metrics:", error);
    // Fallback data when API fails
    return {
      marketCap: getDefaultMetrics(symbol).marketCap,
      volume: getDefaultMetrics(symbol).volume,
      dominance: getDefaultMetrics(symbol).dominance,
      performance: getDefaultMetrics(symbol).performance
    };
  }
};

// Map crypto symbols to CoinGecko IDs
const getCoinGeckoId = (symbol: string): string => {
  const mapping: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'AVAX': 'avalanche-2',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'LINK': 'chainlink'
  };
  
  return mapping[symbol] || 'bitcoin'; // Default to bitcoin if symbol not in mapping
};

// Default metrics for when API fails or for unsupported coins
const getDefaultMetrics = (symbol: string): CryptoMetrics => {
  const defaults: Record<string, CryptoMetrics> = {
    'BTC': {
      marketCap: 1200000000000,
      volume: 48000000000,
      dominance: 42.5,
      performance: 2.8
    },
    'ETH': {
      marketCap: 340000000000,
      volume: 24000000000,
      dominance: 18.5,
      performance: 3.2
    },
    'SOL': {
      marketCap: 48000000000,
      volume: 3500000000,
      dominance: 2.5,
      performance: 5.7
    },
    'USDT': {
      marketCap: 95000000000,
      volume: 80000000000,
      dominance: 5.2,
      performance: 0.1
    }
  };
  
  return defaults[symbol] || defaults['BTC']; // Default to BTC metrics
};

const formatValue = (value: number, format: 'currency' | 'percentage') => {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return `${value.toFixed(2)}%`;
};

const PortfolioMetrics = ({ selectedCrypto }: MetricsProps) => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["metrics", selectedCrypto],
    queryFn: () => fetchCryptoMetrics(selectedCrypto),
    staleTime: 30000,
  });

  const metricCards = [
    { title: "Market Cap", value: metrics?.marketCap || 0, format: "currency" as const },
    { title: "24h Volume", value: metrics?.volume || 0, format: "currency" as const },
    { title: "Dominance", value: metrics?.dominance || 0, format: "percentage" as const },
    { title: "Performance", value: metrics?.performance || 0, format: "percentage" as const },
  ];

  return (
    <div className="animate-fade-in">
      <div className="hidden md:grid md:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <Card 
            key={metric.title} 
            className={cn(
              "p-4 glass-effect transition-all duration-300 hover:scale-[1.02]",
              isLoading && "animate-pulse"
            )}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {metric.title}
            </h3>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className={cn(
                "text-2xl font-bold",
                metric.format === "percentage" && metric.value > 0 && "text-green-500",
                metric.format === "percentage" && metric.value < 0 && "text-red-500"
              )}>
                {formatValue(metric.value, metric.format)}
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Mobile View - Combined Card */}
      <div className="md:hidden">
        <Card className="p-4 glass-effect">
          <div className="grid grid-cols-2 gap-4">
            {metricCards.map((metric, index) => (
              <div 
                key={metric.title}
                className={cn(
                  "p-3",
                  index < 2 ? "border-b" : "",
                  index % 2 === 0 ? "border-r" : "",
                  "border-white/10"
                )}
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {metric.title}
                </h3>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className={cn(
                    "text-xl font-bold",
                    metric.format === "percentage" && metric.value > 0 && "text-green-500",
                    metric.format === "percentage" && metric.value < 0 && "text-red-500"
                  )}>
                    {formatValue(metric.value, metric.format)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioMetrics;
