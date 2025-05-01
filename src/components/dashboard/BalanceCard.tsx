import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ExternalLink, Wallet, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { useToast } from "@/hooks/use-toast";
import { setShowBalance } from "@/lib/redux/slices/walletSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import IdentityDisplay from "../web3/IdentityDisplay";
import WalletConnector from "../web3/WalletConnector";
import EarnButton from "../web3/EarnButton";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const timeRanges = [
  { value: "1h", label: "1H" },
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "1y", label: "1Y" },
];

const BalanceCard = ({
  showBalance,
  setShowBalance,
}: {
  showBalance: boolean;
  setShowBalance: (value: boolean) => void;
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { wallets, loading } = useAppSelector((state) => state.wallet);
  const { prices } = useAppSelector((state) => state.prices);
  const { toast } = useToast();
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [isLoadingPriceChanges, setIsLoadingPriceChanges] = useState(false);

  useEffect(() => {
    // Fetch price changes for default timeframe (24h) on component mount
    fetchPriceChanges(timeRange);
  }, []);

  useEffect(() => {
    // Update redux state when showBalance changes
    dispatch(setShowBalance(showBalance));
  }, [showBalance, dispatch]);

  const fetchPriceChanges = async (period: string) => {
    setIsLoadingPriceChanges(true);
    
    try {
      // Fetch price changes for major cryptos from CoinGecko
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: 'bitcoin,ethereum,solana,ripple,cardano',
          price_change_percentage: period,
          per_page: 100,
          page: 1
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        const changes: Record<string, number> = {};
        response.data.forEach((coin) => {
          const symbol = coin.symbol.toUpperCase();
          const field = `price_change_percentage_${period}`;
          if (coin[field] !== undefined && coin[field] !== null) {
            changes[symbol] = coin[field];
          }
        });
        
        setPriceChanges(changes);
      }
    } catch (error) {
      console.error("Error fetching price changes:", error);
    } finally {
      setIsLoadingPriceChanges(false);
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    fetchPriceChanges(value);
  };

  const handleConnect = (address: string, name?: string) => {
    setConnectedWallet(address);
    setConnectedWalletName(name || null);
    toast({
      title: "Wallet Connected",
      description: `Connected to ${name || address.slice(0, 6) + '...' + address.slice(-4)}`,
    });
  };

  const handleDisconnect = () => {
    setConnectedWallet(null);
    setConnectedWalletName(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const handleFundWallet = () => {
    navigate("/deposit");
  };

  const calculateTotalBalance = () => {
    if (!wallets?.length) return 0;
    return wallets.reduce((acc, wallet) => {
      const price =
        prices.find((p) => p.token === wallet.symbol)?.usdRate || 1;
      return acc + parseFloat(wallet.balance) * price;
    }, 0);
  };

  const getPriceChange = () => {
    if (!wallets?.length) return { percentage: 0, isUp: true };
    
    // Calculate weighted average of price changes
    let totalValue = 0;
    let weightedChangeSum = 0;
    
    wallets.forEach((wallet) => {
      const price = prices.find((p) => p.token === wallet.symbol)?.usdRate || 1;
      const value = parseFloat(wallet.balance) * price;
      const change = priceChanges[wallet.symbol] || 0;
      
      totalValue += value;
      weightedChangeSum += value * change;
    });
    
    if (totalValue > 0) {
      const weightedAverageChange = weightedChangeSum / totalValue;
      return {
        percentage: weightedAverageChange,
        isUp: weightedAverageChange >= 0
      };
    }
    
    return { percentage: 0, isUp: true };
  };
  
  const priceChange = getPriceChange();
  const formattedPriceChange = isNaN(priceChange.percentage) ? "0.00" : priceChange.percentage.toFixed(2);
  const priceChangeDisplay = `${priceChange.isUp ? '+' : ''}${formattedPriceChange}%`;
  const priceChangeColor = priceChange.isUp ? "text-green-500" : "text-red-500";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Total Balance</CardTitle>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          {showBalance ? (
            <EyeOff className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Eye className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            {loading ? (
              <>
                <Skeleton className="h-10 w-40 mb-2" />
                <Skeleton className="h-5 w-20" />
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold">
                  {showBalance
                    ? `$${calculateTotalBalance().toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "••••••"}
                </h2>
                <div className="flex items-center gap-2">
                  <div className={cn("flex items-center", priceChangeColor)}>
                    {isLoadingPriceChanges ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      priceChangeDisplay
                    )}
                  </div>
                  <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                    <SelectTrigger className="h-7 w-16 text-xs">
                      <SelectValue placeholder="24H" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleFundWallet}
              className="bg-dollar-dark hover:bg-dollar text-white"
            >
              Fund Wallet
            </Button>
            
            {connectedWallet ? (
              <div className="flex gap-2">
                <IdentityDisplay 
                  address={connectedWallet}
                  ensName={connectedWalletName}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleDisconnect}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <WalletConnector onConnect={handleConnect} />
            )}
            
            <Button
              onClick={() => navigate("/receive")}
              variant="outline"
              className="text-white"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Receive
            </Button>
            
            <EarnButton />
          </div>

          {wallets?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                My Wallets
              </h3>

              <div className="space-y-3">
                {loading
                  ? Array(3)
                      .fill(null)
                      .map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-14 w-full rounded-lg"
                        />
                      ))
                  : wallets.map((wallet) => {
                      const price =
                        prices.find((p) => p.token === wallet.symbol)?.usdRate ||
                        1;
                      const usdValue = parseFloat(wallet.balance) * price;

                      return (
                        <div
                          key={wallet.symbol}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                              <span>{wallet.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{wallet.symbol}</p>
                              <p className="text-xs text-muted-foreground">
                                {wallet.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {showBalance
                                ? `${parseFloat(wallet.balance).toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    }
                                  )} ${wallet.symbol}`
                                : "••••••"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {showBalance
                                ? `$${usdValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`
                                : "••••••"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
