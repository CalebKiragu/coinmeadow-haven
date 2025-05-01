
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

// Define data point structure
interface DataPoint {
  timestamp: number;
  price: number;
  date?: string;
}

interface PortfolioChartProps {
  selectedCrypto: string;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

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

// Function to fetch price history from CoinGecko
const fetchPriceHistory = async (
  coinId: string,
  timeRange: TimeRange
): Promise<DataPoint[]> => {
  // Map time ranges to CoinGecko parameters
  const rangeMap: Record<TimeRange, { days: number, interval: string }> = {
    '1D': { days: 1, interval: 'hourly' },
    '1W': { days: 7, interval: 'daily' },
    '1M': { days: 30, interval: 'daily' },
    '3M': { days: 90, interval: 'daily' },
    '1Y': { days: 365, interval: 'daily' },
    'ALL': { days: 'max', interval: 'weekly' },
  };

  const { days, interval } = rangeMap[timeRange];

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days,
          interval: days === 1 ? 'hourly' : undefined, // Override for 1D to get hourly data
        },
      }
    );

    // Transform CoinGecko response to our DataPoint format
    return response.data.prices.map((item: [number, number]) => ({
      timestamp: item[0],
      price: item[1],
      date: new Date(item[0]).toLocaleString(), // Format date for tooltip
    }));
  } catch (error) {
    console.error('Error fetching price history:', error);
    return generateMockData(timeRange); // Fallback to mock data on error
  }
};

// Generate mock data if API fails
const generateMockData = (timeRange: TimeRange): DataPoint[] => {
  const now = Date.now();
  const data: DataPoint[] = [];
  let points = 30;
  let step = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  
  switch (timeRange) {
    case '1D':
      points = 24;
      step = 60 * 60 * 1000; // 1 hour
      break;
    case '1W':
      points = 7;
      step = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '1M':
      points = 30;
      step = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '3M':
      points = 90;
      step = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '1Y':
      points = 52;
      step = 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
    case 'ALL':
      points = 60;
      step = 30 * 24 * 60 * 60 * 1000; // 1 month
      break;
  }

  // Generate price starting at around current BTC price
  let price = 65000;
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - i * step;
    // Add some random variation to the price
    price = price + (Math.random() - 0.5) * 1000;
    data.push({
      timestamp,
      price,
      date: new Date(timestamp).toLocaleString(),
    });
  }
  
  return data;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border border-border rounded-md shadow-lg">
        <p className="text-sm font-medium">{payload[0].payload.date}</p>
        <p className="text-base font-bold text-primary">
          ${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const PortfolioChart = ({ selectedCrypto }: PortfolioChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['priceHistory', selectedCrypto, timeRange],
    queryFn: () => fetchPriceHistory(getCoinGeckoId(selectedCrypto), timeRange),
    staleTime: 60000, // Cache for 1 minute
  });

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '1D':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1W':
      case '1M':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case '3M':
      case '1Y':
        return date.toLocaleDateString([], { month: 'short' });
      case 'ALL':
        return date.toLocaleDateString([], { year: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
  };
  
  // Calculate price change percentage
  const calculatePriceChange = () => {
    if (!chartData || chartData.length < 2) return { amount: 0, percentage: 0 };
    
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    const change = lastPrice - firstPrice;
    const percentage = (change / firstPrice) * 100;
    
    return { amount: change, percentage };
  };
  
  const priceChange = chartData ? calculatePriceChange() : { amount: 0, percentage: 0 };
  const isPriceUp = priceChange.amount >= 0;
  
  const timeRangeButtons: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
  
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{selectedCrypto} Price Chart</CardTitle>
          <div className="bg-muted rounded-lg flex">
            {timeRangeButtons.map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <Skeleton className="h-4 w-32 mt-1" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              ${chartData && chartData.length > 0 
                ? chartData[chartData.length - 1].price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "0.00"
              }
            </span>
            <span className={`text-sm font-medium ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
              {isPriceUp ? '+' : ''}{priceChange.percentage.toFixed(2)}%
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPriceUp ? "#10B981" : "#EF4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPriceUp ? "#10B981" : "#EF4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis} 
                tick={{ fontSize: 12 }}
                stroke="rgba(255,255,255,0.3)" 
              />
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                width={80}
                tick={{ fontSize: 12 }}
                domain={['dataMin', 'dataMax']}
                stroke="rgba(255,255,255,0.3)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPriceUp ? "#10B981" : "#EF4444"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
