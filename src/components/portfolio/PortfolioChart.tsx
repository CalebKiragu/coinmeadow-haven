import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  selectedCrypto: string;
}

const PortfolioChart = ({ selectedCrypto }: ChartProps) => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart", selectedCrypto],
    queryFn: async () => {
      // Replace with your actual API endpoint
      const response = await axios.get(`/api/chart/${selectedCrypto}`);
      return response.data;
    },
    enabled: !!selectedCrypto,
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card className="p-6 glass-effect">
      <div className="h-[400px]">
        <ChartContainer
          config={{
            price: {
              theme: {
                light: "#6F4E37",
                dark: "#85BB65",
              },
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <ChartTooltip>
                <ChartTooltipContent />
              </ChartTooltip>
              <Area
                type="monotone"
                dataKey="price"
                stroke="var(--color-price)"
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