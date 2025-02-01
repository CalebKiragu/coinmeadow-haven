import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface MetricsProps {
  selectedCrypto: string;
}

const PortfolioMetrics = ({ selectedCrypto }: MetricsProps) => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["metrics", selectedCrypto],
    queryFn: async () => {
      // Replace with your actual API endpoint
      const response = await axios.get(`/api/metrics/${selectedCrypto}`);
      return response.data;
    },
    enabled: !!selectedCrypto,
  });

  const metricCards = [
    { title: "Market Cap", value: metrics?.marketCap || 0, format: "currency" },
    { title: "24h Volume", value: metrics?.volume || 0, format: "currency" },
    { title: "Dominance", value: metrics?.dominance || 0, format: "percentage" },
    { title: "Performance", value: metrics?.performance || 0, format: "percentage" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {metricCards.map((metric) => (
        <Card key={metric.title} className="p-4 glass-effect">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            {metric.title}
          </h3>
          {isLoading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <p className="text-2xl font-bold">
              {metric.format === "currency"
                ? formatCurrency(metric.value)
                : `${metric.value.toFixed(2)}%`}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
};

export default PortfolioMetrics;