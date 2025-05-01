
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cryptoCurrencies } from '@/types/currency';
import axios from 'axios';

const timeRanges = [
  { value: '1h', label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '1y', label: '1Y' },
];

interface ChartData {
  date: string;
  value: number;
  volume: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

const formatDate = (date: string, timeRange: string) => {
  const dateObj = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  if (timeRange === '1h' || timeRange === '24h') {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }

  return dateObj.toLocaleDateString(undefined, options);
};

const formatValue = (value: number) => {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return value.toFixed(2);
};

const PortfolioChart = ({
  selectedCrypto = 'BTC',
}: {
  selectedCrypto?: string;
}) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState('line');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${selectedCrypto.toLowerCase()}/market_chart`,
          {
            params: {
              vs_currency: 'usd',
              days: timeRange.replace('h', ''),
              interval:
                timeRange === '1h' || timeRange === '24h' ? 'hourly' : 'daily',
            },
          }
        );

        const data = response.data.prices.map((item: any) => ({
          date: new Date(item[0]).toLocaleDateString(),
          value: item[1],
        }));

        // Mock candlestick data
        const candlestickData = response.data.prices.map((item: any) => ({
          date: new Date(item[0]).toLocaleDateString(),
          open: item[1],
          close: item[1] + (Math.random() - 0.5) * 10,
          high: item[1] + Math.random() * 15,
          low: item[1] - Math.random() * 15,
          volume: Math.random() * 100,
        }));

        setChartData(chartType === 'line' ? data : candlestickData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [selectedCrypto, timeRange, chartType]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  const handleChartTypeChange = (type: string) => {
    setChartType(type);
  };

  // Custom formatter function for number values
  const customFormatter = (value: any) => {
    if (typeof value === 'number') {
      return formatValue(value);
    }
    return value;
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <CardTitle>
          {selectedCrypto} Price Chart ({timeRange})
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChartTypeChange('line')}
            className={chartType === 'line' ? 'bg-secondary' : ''}
          >
            Line
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChartTypeChange('candlestick')}
            className={chartType === 'candlestick' ? 'bg-secondary' : ''}
          >
            Candlestick
          </Button>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="border rounded-md px-2 py-1 bg-background text-foreground"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-full w-full" />
            </div>
          ) : null}

          {chartType === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  tickFormatter={(value) => `$${customFormatter(value)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                  }}
                  formatter={(value) => `$${customFormatter(Number(value))}`}
                  labelFormatter={(label) => formatDate(label, timeRange)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  fillOpacity={0.3}
                  fill="url(#colorValue)"
                />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartType === 'candlestick' && (
            <ResponsiveContainer width="100%" height="100%">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <BarChart
                  width={500}
                  height={300}
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                    padding={{ left: 10, right: 10 }}
                    tickFormatter={(value) => formatDate(value, timeRange)}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => `$${customFormatter(Number(value))}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                    }}
                    formatter={(value, name) => {
                      if (Array.isArray(value)) {
                        return [`$${customFormatter(Number(value[0]))} → $${customFormatter(Number(value[1]))}`, 'Price']
                      }
                      return [`$${customFormatter(Number(value))}`, name];
                    }}
                    labelFormatter={(label) => formatDate(label, timeRange)}
                  />
                  <Bar
                    dataKey="volume"
                    fill="rgba(255,255,255,0.1)"
                    opacity={0.3}
                    yAxisId={1}
                  />
                  <Bar
                    dataKey={(entry) => [entry.open, entry.close]}
                    shape={(props: any) => {
                      const { x, y, width, height } = props;
                      const payload = props.payload;
                      const isRising = payload.open <= payload.close;
                      const fill = isRising ? "#10B981" : "#EF4444";
                      
                      // Draw the wick
                      const wickX = x + width / 2;
                      const wickTop = isRising ? 
                        y - (Number(payload.high) - Number(payload.close)) * height / (Number(payload.high) - Number(payload.low)) :
                        y - (Number(payload.high) - Number(payload.open)) * height / (Number(payload.high) - Number(payload.low));
                      const wickBottom = isRising ?
                        y + height + (Number(payload.open) - Number(payload.low)) * height / (Number(payload.high) - Number(payload.low)) :
                        y + height + (Number(payload.close) - Number(payload.low)) * height / (Number(payload.high) - Number(payload.low));
                      
                      return (
                        <g>
                          {/* Candle body */}
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={fill}
                            stroke={fill}
                          />
                          {/* Wick */}
                          <line
                            x1={wickX}
                            y1={wickTop}
                            x2={wickX}
                            y2={wickBottom}
                            stroke={fill}
                            strokeWidth={1}
                          />
                        </g>
                      );
                    }}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
