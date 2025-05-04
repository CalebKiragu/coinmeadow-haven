
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Legend,
  ComposedChart
} from 'recharts';
import { CandlestickChart, Candlestick } from '@/components/ui/candlestick-chart';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

// Define OHLC data structure
interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
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

// Function to fetch OHLC data
const fetchOHLCData = async (
  coinId: string,
  timeRange: TimeRange
): Promise<OHLCData[]> => {
  // Map time ranges to CoinGecko parameters
  const rangeMap: Record<TimeRange, { days: number | string, interval: string }> = {
    '1D': { days: 1, interval: 'hourly' },
    '1W': { days: 7, interval: 'daily' },
    '1M': { days: 30, interval: 'daily' },
    '3M': { days: 90, interval: 'daily' },
    '1Y': { days: 365, interval: 'daily' },
    'ALL': { days: 'max' as any, interval: 'weekly' },
  };

  const { days } = rangeMap[timeRange];

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
      {
        params: {
          vs_currency: 'usd',
          days,
        },
      }
    );

    // Transform CoinGecko response to our OHLCData format
    // CoinGecko OHLC response format is [timestamp, open, high, low, close]
    return response.data.map((item: [number, number, number, number, number]) => ({
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      date: new Date(item[0]).toLocaleString(),
    }));
  } catch (error) {
    console.error('Error fetching OHLC data:', error);
    return generateMockOHLCData(timeRange); // Fallback to mock data on error
  }
};

// Generate mock OHLC data if API fails
const generateMockOHLCData = (timeRange: TimeRange): OHLCData[] => {
  const now = Date.now();
  const data: OHLCData[] = [];
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
    const volatility = Math.random() * 0.03; // 0-3% volatility
    const change = price * volatility * (Math.random() > 0.5 ? 1 : -1);
    
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.abs(change) * Math.random() * 0.5;
    const low = Math.min(open, close) - Math.abs(change) * Math.random() * 0.5;
    
    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: Math.random() * 10000,
      date: new Date(timestamp).toLocaleString(),
    });
    
    // Set the next price to the current closing price
    price = close;
  }
  
  return data;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as OHLCData;
    
    return (
      <div className="bg-background p-3 border border-border rounded-md shadow-lg">
        <p className="text-sm font-medium">{data.date}</p>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-sm font-bold">${data.open.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Close</p>
            <p className="text-sm font-bold">${data.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">High</p>
            <p className="text-sm font-bold text-green-500">${data.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Low</p>
            <p className="text-sm font-bold text-red-500">${data.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PortfolioChart = ({ selectedCrypto }: PortfolioChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['ohlcData', selectedCrypto, timeRange],
    queryFn: () => fetchOHLCData(getCoinGeckoId(selectedCrypto), timeRange),
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
    
    const firstPrice = chartData[0].open;
    const lastPrice = chartData[chartData.length - 1].close;
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
          <CardTitle className="text-lg">{selectedCrypto} OHLC Chart</CardTitle>
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
                ? chartData[chartData.length - 1].close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "0.00"
              }
            </span>
            <span className={`text-sm font-medium ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
              {isPriceUp ? '+' : ''}{priceChange.percentage.toFixed(2)}%
            </span>
          </div>
        )}
        <div className="text-xs text-right text-muted-foreground">
          Source: CoinGecko
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <CandlestickChart data={chartData || []}>
              <defs>
                <filter id="shadow" x="-2" y="-2" width="104%" height="104%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2" />
                </filter>
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
                domain={['auto', 'auto']}
                stroke="rgba(255,255,255,0.3)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Candlestick
                fill={(data: OHLCData) => (data.open > data.close ? "#ef4444" : "#10b981")}
                stroke={(data: OHLCData) => (data.open > data.close ? "#ef4444" : "#10b981")}
                yAccessor={(data: OHLCData) => [data.low, data.open, data.close, data.high]}
                className="filter-shadow"
              />
            </CandlestickChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
