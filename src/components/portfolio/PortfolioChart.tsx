import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ChartProps {
  selectedCrypto: string;
}

const PortfolioChart = ({ selectedCrypto }: ChartProps) => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart", selectedCrypto],
    queryFn: async () => {
      // Using mock data for now - replace with actual API endpoint
      return Array.from({ length: 30 }, (_, i) => ({
        timestamp: `Day ${i + 1}`,
        price: Math.random() * 50000 + 30000,
      }));
    },
    staleTime: 30000, // Cache data for 30 seconds
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card className="p-6 glass-effect">
      <div className="h-[400px]">
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: '#666' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#4CAF50"
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};

export default PortfolioChart;