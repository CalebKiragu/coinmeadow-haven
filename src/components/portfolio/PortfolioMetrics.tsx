import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MetricsProps {
  selectedCrypto: string;
}

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
    queryFn: async () => {
      // Using mock data for now - replace with actual API endpoint
      return {
        marketCap: 1200000000000,
        volume: 48000000000,
        dominance: 42.5,
        performance: 2.8
      };
    },
    staleTime: 30000, // Cache data for 30 seconds
  });

  const metricCards = [
    { title: "Market Cap", value: metrics?.marketCap || 0, format: "currency" as const },
    { title: "24h Volume", value: metrics?.volume || 0, format: "currency" as const },
    { title: "Dominance", value: metrics?.dominance || 0, format: "percentage" as const },
    { title: "Performance", value: metrics?.performance || 0, format: "percentage" as const },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
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
  );
};

export default PortfolioMetrics;