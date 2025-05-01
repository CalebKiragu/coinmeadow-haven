
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ExternalLink, LogOut } from "lucide-react";
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
  setShowBalance: setParentShowBalance,
}: {
  showBalance: boolean;
  setShowBalance: (value: boolean) => void;
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { wallets, loading } = useAppSelector((state) => state.wallet);
  const priceState = useAppSelector((state) => state.price) || { prices: [] };
  const prices = priceState?.prices || [];
  const { toast } = useToast();
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [isLoadingPriceChanges, setIsLoadingPriceChanges] = useState(false);
  const [animateBalance, setAnimateBalance] = useState(false);

  useEffect(() => {
    // Fetch price changes for default timeframe (24h) on component mount
    fetchPriceChanges(timeRange);
  }, []);

  useEffect(() => {
    // Update redux state when showBalance changes
    if (typeof showBalance === 'boolean') {
      dispatch(setShowBalance(showBalance));
    }
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
      const priceInfo = prices.find((p) => p.token === wallet.symbol);
      const price = priceInfo?.usdRate || 1;
      return acc + parseFloat(wallet.balance) * price;
    }, 0);
  };

  const getPriceChange = () => {
    if (!wallets?.length) return { percentage: 0, isUp: true };
    
    // Calculate weighted average of price changes
    let totalValue = 0;
    let weightedChangeSum = 0;
    
    wallets.forEach((wallet) => {
      const priceInfo = prices.find((p) => p.token === wallet.symbol);
      const price = priceInfo?.usdRate || 1;
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

  // Updated handler to update both local and parent state
  const handleBalanceVisibilityToggle = () => {
    setAnimateBalance(true);
    setTimeout(() => setAnimateBalance(false), 300);
    const newShowBalance = !showBalance;
    setParentShowBalance(newShowBalance);
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white/10 to-white/5 dark:from-black/20 dark:to-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between bg-white/5 dark:bg-black/20">
        <CardTitle className="text-xl font-bold text-white">Total Balance</CardTitle>
        <button
          onClick={handleBalanceVisibilityToggle}
          className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95"
          aria-label={showBalance ? "Hide balance" : "Show balance"}
        >
          {showBalance ? (
            <EyeOff className="h-5 w-5 text-white/70 hover:text-white" />
          ) : (
            <Eye className="h-5 w-5 text-white/70 hover:text-white" />
          )}
        </button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div>
            {loading ? (
              <>
                <Skeleton className="h-10 w-40 mb-2 bg-white/10" />
                <Skeleton className="h-5 w-20 bg-white/10" />
              </>
            ) : (
              <>
                <h2 className={cn(
                  "text-4xl font-bold text-white transition-all duration-300",
                  animateBalance && "opacity-0 transform scale-95"
                )}>
                  {showBalance
                    ? `$${calculateTotalBalance().toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "••••••"}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className={cn("flex items-center font-medium", priceChangeColor)}>
                    {isLoadingPriceChanges ? (
                      <Skeleton className="h-4 w-16 bg-white/10" />
                    ) : (
                      priceChangeDisplay
                    )}
                  </div>
                  <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                    <SelectTrigger className="h-7 w-16 text-xs bg-white/10 border-white/20">
                      <SelectValue placeholder="24H" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 dark:bg-black/90 backdrop-blur-lg">
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
              className="bg-dollar-dark hover:bg-dollar text-white shadow-md hover:shadow-lg transition-all"
              size="sm"
            >
              Fund Wallet
            </Button>
            
            {connectedWallet ? (
              <div className="flex gap-2">
                <IdentityDisplay 
                  address={connectedWallet}
                  ensName={connectedWalletName || undefined}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9 bg-white/5 border-white/20 hover:bg-white/10"
                  onClick={handleDisconnect}
                >
                  <LogOut className="h-4 w-4 text-white/70" />
                </Button>
              </div>
            ) : (
              <WalletConnector onConnect={handleConnect} />
            )}
            
            <Button
              onClick={() => navigate("/receive")}
              variant="outline"
              className="text-white bg-white/5 border-white/20 hover:bg-white/10 transition-all"
              size="sm"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Receive
            </Button>
            
            <EarnButton />
          </div>

          {wallets?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white/70">
                My Wallets
              </h3>

              <div className="space-y-3">
                {loading
                  ? Array(3)
                      .fill(null)
                      .map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-14 w-full rounded-lg bg-white/10"
                        />
                      ))
                  : wallets.map((wallet) => {
                      const priceInfo = prices.find((p) => p.token === wallet.symbol);
                      const price = priceInfo?.usdRate || 1;
                      const usdValue = parseFloat(wallet.balance) * price;
                      const walletSymbol = wallet.symbol || "";

                      return (
                        <div
                          key={walletSymbol}
                          className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center shadow-inner">
                              <span className="text-white font-medium">{walletSymbol.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{walletSymbol}</p>
                              <p className="text-xs text-white/60">
                                {wallet.name || walletSymbol}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {showBalance
                                ? `${parseFloat(wallet.balance).toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    }
                                  )} ${walletSymbol}`
                                : "••••••"}
                            </p>
                            <p className="text-xs text-white/60">
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
