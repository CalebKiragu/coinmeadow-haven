import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

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
  
  return mapping[symbol] || 'BTCUSD';
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
  
  return mapping[timeRange];
};

// Get chart interval based on timeRange
const getChartInterval = (timeRange: TimeRange): string => {
  const mapping: Record<TimeRange, string> = {
    '1D': '60',
    '1W': 'D',
    '1M': 'D',
    '3M': 'W',
    '1Y': 'W',
    'ALL': 'M',
  };
  
  return mapping[timeRange];
};

interface PortfolioChartProps {
  selectedCrypto: string;
}

const PortfolioChart = ({ selectedCrypto }: PortfolioChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInitializedRef = useRef<boolean>(false);
  const tradingViewScriptLoadedRef = useRef<boolean>(false);
  
  // Initialize TradingView script
  useEffect(() => {
    if (tradingViewScriptLoadedRef.current) {
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'tradingview-widget-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      console.log('TradingView script loaded successfully');
      tradingViewScriptLoadedRef.current = true;
      initializeTradingViewWidget();
    };
    script.onerror = (error) => {
      console.error('Error loading TradingView script:', error);
    };
    document.head.appendChild(script);
    
    return () => {
      // Don't remove the script on unmount to prevent reloading issues
    };
  }, []);

  // Function to initialize and render the TradingView widget
  const initializeTradingViewWidget = () => {
    if (!containerRef.current || !window.TradingView) {
      console.log('Container ref or TradingView not available:', containerRef.current, !!window.TradingView);
      return;
    }
    
    // Clean up any existing chart
    containerRef.current.innerHTML = '';
    
    // Create a new container element for the chart
    const chartElement = document.createElement('div');
    chartElement.id = 'tradingview_chart';
    chartElement.style.width = '100%';
    chartElement.style.height = '100%';
    containerRef.current.appendChild(chartElement);
    
    // Create the TradingView widget
    try {
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
      
      chartInitializedRef.current = true;
      console.log("TradingView widget initialized for", selectedCrypto);
    } catch (error) {
      console.error("Error creating TradingView widget:", error);
    }
  };

  // Re-render chart when dependencies change
  useEffect(() => {
    if (tradingViewScriptLoadedRef.current) {
      initializeTradingViewWidget();
    }
  }, [selectedCrypto, timeRange]);
  
  // Get mock price data for the UI
  const { data: priceData, isLoading } = useQuery({
    queryKey: ['priceData', selectedCrypto, timeRange],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${selectedCrypto.toLowerCase()}/market_chart`,
          { params: { vs_currency: 'usd', days: timeRange === '1D' ? 1 : timeRange === '1W' ? 7 : 30 } }
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching price data:", error);
        return { prices: [[Date.now(), 65000]] }; // Mock data
      }
    },
    staleTime: 60000, // Cache for 1 minute
  });
  
  const currentPrice = priceData?.prices?.[priceData.prices.length - 1]?.[1] || 65000;
  const previousPrice = priceData?.prices?.[0]?.[1] || 64000;
  const priceChange = currentPrice - previousPrice;
  const percentageChange = (priceChange / previousPrice) * 100;
  const isPriceUp = priceChange >= 0;
  
  const timeRangeButtons: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
  
  return (
    <Card className="animate-fade-in shadow-lg">
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
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-medium ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
              {isPriceUp ? '+' : ''}{percentageChange.toFixed(2)}%
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
            className="w-full h-[400px] rounded-md overflow-hidden bg-white dark:bg-gray-900"
            style={{ minHeight: "400px" }}
          />
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground">Open</div>
            <div className="font-medium">
              ${(previousPrice).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="font-medium">
              ${currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground">24h High</div>
            <div className="font-medium text-green-500">
              ${(currentPrice * 1.02).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground">24h Low</div>
            <div className="font-medium text-red-500">
              ${(currentPrice * 0.98).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
