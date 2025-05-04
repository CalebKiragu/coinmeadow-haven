import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

// No need to redeclare TradingView interface as it's already defined in src/types/tradingview.d.ts
// Just using the existing interface

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

// Map crypto symbols to TradingView symbols
const getTradingViewSymbol = (symbol: string): string => {
  const mapping: Record<string, string> = {
    'BTC': 'BTCUSD',
    'ETH': 'ETHUSD',
    'SOL': 'SOLUSD',
    'USDT': 'USDTUSD',
    'USDC': 'USDCUSD',
    'XRP': 'XRPUSD',
    'ADA': 'ADAUSD',
    'AVAX': 'AVAXUSD',
    'DOGE': 'DOGEUSD',
    'DOT': 'DOTUSD',
    'LINK': 'LINKUSD'
  };
  
  return mapping[symbol] || 'BTCUSD'; // Default to BTCUSD if symbol not in mapping
};

// Map time ranges to TradingView intervals
const getTimeRangeParam = (timeRange: TimeRange): string => {
  const mapping: Record<TimeRange, string> = {
    '1D': '1D',
    '1W': '1W',
    '1M': '1M',
    '3M': '3M',
    '1Y': '12M',
    'ALL': 'ALL',
  };
  
  return mapping[timeRange] || '1D';
};

// Get chart interval based on timeRange
const getChartInterval = (timeRange: TimeRange): string => {
  const mapping: Record<TimeRange, string> = {
    '1D': '60', // 60 minutes
    '1W': 'D',  // Daily
    '1M': 'D',  // Daily
    '3M': 'W',  // Weekly
    '1Y': 'W',  // Weekly
    'ALL': 'M',  // Monthly
  };
  
  return mapping[timeRange] || 'D';
};

// Map CoinGecko IDs for API fallback
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
  
  return mapping[symbol] || 'bitcoin';
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

const PortfolioChart = ({ selectedCrypto }: PortfolioChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['ohlcData', selectedCrypto, timeRange],
    queryFn: () => fetchOHLCData(getCoinGeckoId(selectedCrypto), timeRange),
    staleTime: 60000, // Cache for 1 minute
  });

  // Initialize TradingView widget when component mounts or when dependencies change
  useEffect(() => {
    // First, clean up any existing chart to prevent duplicates
    const container = containerRef.current;
    if (!container) return;
    
    container.innerHTML = '';

    // Create a new container element for the chart
    const chartElement = document.createElement('div');
    chartElement.id = 'tradingview_chart';
    chartElement.style.width = '100%';
    chartElement.style.height = '100%';
    container.appendChild(chartElement);

    const loadTradingViewScript = () => {
      // Check if script is already loaded
      if (document.getElementById('tradingview-widget-script')) {
        initializeTradingViewWidget();
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initializeTradingViewWidget;
      document.head.appendChild(script);
    };

    const initializeTradingViewWidget = () => {
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${getTradingViewSymbol(selectedCrypto)}`,
          interval: getChartInterval(timeRange),
          timezone: 'Etc/UTC',
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          style: '1', // Candlestick chart
          locale: 'en',
          enable_publishing: false,
          hide_side_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: 'tradingview_chart',
          studies: ["RSI@tv-basicstudies"],
          time_frames: [
            { text: "1D", resolution: "60" },
            { text: "1W", resolution: "D" },
            { text: "1M", resolution: "D" },
            { text: "3M", resolution: "W" },
            { text: "1Y", resolution: "W" },
            { text: "ALL", resolution: "M" }
          ],
          range: getTimeRangeParam(timeRange),
          overrides: {
            "paneProperties.background": document.documentElement.classList.contains('dark') ? "#111111" : "#f9f9f9",
            "paneProperties.vertGridProperties.color": document.documentElement.classList.contains('dark') ? "#1e1e1e" : "#e1e1e1",
            "paneProperties.horzGridProperties.color": document.documentElement.classList.contains('dark') ? "#1e1e1e" : "#e1e1e1",
          }
        });
        
        console.log("TradingView widget initialized for", selectedCrypto);
      } else {
        console.error("TradingView not available");
      }
    };

    loadTradingViewScript();

    // Clean up function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
      
      // Remove the script if needed
      const oldScript = document.getElementById('tradingview-widget-script');
      if (oldScript && oldScript.parentNode) {
        oldScript.parentNode.removeChild(oldScript);
      }
    };
  }, [selectedCrypto, timeRange]);

  // Calculate price change percentage based on last available data
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
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-lg">{selectedCrypto} Price Chart</CardTitle>
          <div className="bg-muted rounded-lg flex flex-wrap">
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl md:text-2xl font-bold">
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
          Data source: TradingView
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div 
            ref={containerRef}
            className="w-full h-[400px] rounded-md overflow-hidden"
          />
        )}
        
        {chartData && chartData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Open</div>
              <div className="font-medium">
                ${chartData[chartData.length-1].open.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Close</div>
              <div className="font-medium">
                ${chartData[chartData.length-1].close.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">High</div>
              <div className="font-medium text-green-500">
                ${chartData[chartData.length-1].high.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Low</div>
              <div className="font-medium text-red-500">
                ${chartData[chartData.length-1].low.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
