import { useEffect, useState } from "react";
import axios from "axios";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioChartProps {
  selectedCrypto: string;
}

interface PriceData {
  timestamp: number;
  price: number;
}

const PortfolioChart = ({ selectedCrypto }: PortfolioChartProps) => {
  const [chartData, setChartData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // Replace with your actual API endpoint
        const response = await axios.get(`/api/chart/${selectedCrypto}`);
        setChartData(response.data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Use mock data for demonstration
        const mockData = Array.from({ length: 30 }, (_, i) => ({
          timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
          price: 30000 + Math.random() * 5000,
        }));
        setChartData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedCrypto]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-none">
        <CardHeader>
          <CardTitle className="text-white">Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full bg-gray-400/20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-none">
      <CardHeader>
        <CardTitle className="text-white">{selectedCrypto} Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                stroke="#fff"
              />
              <YAxis
                tickFormatter={formatPrice}
                stroke="#fff"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelFormatter={formatDate}
                formatter={(value: number) => [formatPrice(value), "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;