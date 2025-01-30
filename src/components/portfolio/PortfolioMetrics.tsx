import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioMetricsProps {
  selectedCrypto: string;
}

interface MetricData {
  marketCap: number;
  volume24h: number;
  dominance: number;
  performance7d: number;
}

const PortfolioMetrics = ({ selectedCrypto }: PortfolioMetricsProps) => {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        // Replace with your actual API endpoint
        const response = await axios.get(`/api/metrics/${selectedCrypto}`);
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        // Use mock data for demonstration
        setMetrics({
          marketCap: 800000000000,
          volume24h: 25000000000,
          dominance: 42.5,
          performance7d: 5.2,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedCrypto]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white/10 backdrop-blur-lg border-none text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-24 bg-gray-400/20" />
          ) : (
            <div className="text-2xl font-bold">{formatNumber(metrics?.marketCap || 0)}</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-lg border-none text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-24 bg-gray-400/20" />
          ) : (
            <div className="text-2xl font-bold">{formatNumber(metrics?.volume24h || 0)}</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-lg border-none text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Dominance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-24 bg-gray-400/20" />
          ) : (
            <div className="text-2xl font-bold">{metrics?.dominance.toFixed(2)}%</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-lg border-none text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">7d Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-24 bg-gray-400/20" />
          ) : (
            <div className={`text-2xl font-bold ${metrics?.performance7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics?.performance7d >= 0 ? '+' : ''}{metrics?.performance7d.toFixed(2)}%
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioMetrics;