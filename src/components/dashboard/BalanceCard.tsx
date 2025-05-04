import { useState, useEffect } from "react";
import { Eye, EyeOff, ChevronDown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import GlassCard from "../ui/GlassCard";
import { Badge } from "../ui/badge";
import { cryptoCurrencies, fiatCurrencies } from "@/types/currency";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  setSelectedCrypto,
  setSelectedFiat,
  Currency,
} from "@/lib/redux/slices/walletSlice";
import { ApiService } from "@/lib/services";
import { Skeleton } from "../ui/skeleton";
import { usePasskeyAuth } from "@/hooks/usePasskeyAuth";
import { useToast } from "@/hooks/use-toast";
import CheckoutDialog from "../web3/CheckoutDialog";
import Earn from "../web3/Earn";
import IdentityDisplay from "../web3/IdentityDisplay";
import WalletConnector from "../web3/WalletConnector";
import { StakingService } from "@/lib/services/stakingService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ethers } from "ethers";

interface BalanceCardProps {
  showBalance: boolean;
  setShowBalance: (value: boolean) => void;
}

// Time periods for price changes
type TimePeriod = "1h" | "6h" | "12h" | "24h" | "7d" | "30d" | "12m";

interface StakingAsset {
  symbol: string;
  name: string;
  balance: string;
  apy: string;
  decimals: number;
}

const BalanceCard = ({ showBalance, setShowBalance }: BalanceCardProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { verifyPasskey, isPasskeyVerified, isVerifying } = usePasskeyAuth();

  const { prices } = useAppSelector((state) => state.price);
  const { user, merchant } = useAppSelector((state) => state.auth);
  const { wallets, selectedCrypto, selectedFiat, lastUpdated } = useAppSelector(
    (state) => state.wallet
  );

  const [isLoading, setIsLoading] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [earnDialogOpen, setEarnDialogOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<any>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>("24h");
  const [stakingAssets, setStakingAssets] = useState<StakingAsset[]>([]);

  // Fetch wallet data when component mounts or selected currencies change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await ApiService.updateDashboard({
          email: user?.email || merchant?.email || "",
          phone: user?.phone || merchant?.phone || "",
          basePair: selectedFiat,
          isMerchant: merchant ? "true" : "false",
        });
      } catch (error) {
        console.error("Error updating dashboard: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user || merchant) fetchData();
  }, [user, merchant, selectedCrypto, selectedFiat]);

  // Load staking assets when connected wallet changes
  useEffect(() => {
    const loadStakingAssets = async () => {
      if (connectedWallet && walletProvider) {
        try {
          // For Ethereum compatible wallets, we can use ethers.js
          if (walletProvider.provider?.isMetaMask || walletProvider.isCoinbaseWallet) {
            const provider = new ethers.providers.Web3Provider(walletProvider);
            
            try {
              const stakingInfo = await StakingService.getStakingInfo(provider, connectedWallet);
              
              // Set the staking assets based on real data from the provider
              setStakingAssets([
                {
                  symbol: stakingInfo.tokenSymbol,
                  name: stakingInfo.tokenName,
                  balance: stakingInfo.tokenBalance,
                  apy: stakingInfo.apy,
                  decimals: stakingInfo.tokenDecimals
                }
              ]);
            } catch (error) {
              console.error("Error loading real staking data:", error);
              // Fallback to mock data
              setStakingAssets(StakingService.getMockStakingAssets());
            }
          } else {
            // For non-ethereum wallets or if ethers not available, use mock data
            setStakingAssets(StakingService.getMockStakingAssets());
          }
        } catch (error) {
          console.error("Error loading staking assets:", error);
          setStakingAssets(StakingService.getMockStakingAssets());
        }
      } else {
        // If no wallet is connected, use wallet balances or mock data
        const walletAssets = wallets
          .filter((w) => ["BTC", "ETH", "USDC", "USDT"].includes(w.currency))
          .map((w) => ({
            symbol: w.currency,
            name: cryptoCurrencies.find((c) => c.symbol === w.currency)?.name || w.currency,
            balance: w.balance.availableBalance,
            apy: w.currency === "USDC" ? "4.2%" : w.currency === "USDT" ? "3.8%" : "2.1%",
            decimals: w.currency === "USDC" || w.currency === "USDT" ? 6 : 18
          }));
        
        setStakingAssets(walletAssets.length > 0 ? walletAssets : StakingService.getMockStakingAssets());
      }
    };
    
    loadStakingAssets();
  }, [connectedWallet, walletProvider, wallets]);

  const handleSelectCrypto = (value: string) => {
    dispatch(setSelectedCrypto(value));
  };

  const handleSelectFiat = (value: string) => {
    dispatch(setSelectedFiat(value as Currency));
  };

  const handleSelectTimePeriod = (value: TimePeriod) => {
    setSelectedTimePeriod(value);
  };

  // Get the selected crypto data
  const selectedCryptoData = cryptoCurrencies.find(
    (c) => c.symbol === selectedCrypto
  );

  // Get the selected fiat data
  const selectedFiatData = fiatCurrencies.find((f) => f.code === selectedFiat);

  // Get price data for the selected crypto
  const selectedCryptoPrice = prices?.find(
    (price) => price.currency === selectedCrypto
  );

  // Mock price change data for different time periods (replace with real data)
  const getPriceChangeByPeriod = (period: TimePeriod): number => {
    // This would be replaced with real API data
    const mockChanges = {
      "1h": 0.5,
      "6h": 1.2,
      "12h": -0.8,
      "24h": selectedCryptoPrice ? Number(selectedCryptoPrice.change) : 2.5,
      "7d": 5.7,
      "30d": -3.2,
      "12m": 12.8
    };
    
    // Check for NaN and provide default values
    const change = mockChanges[period];
    return isNaN(change) ? 0 : change;
  };

  const formatPrice = (price: number) => {
    if (isNaN(price)) return `${selectedFiatData?.symbol || '$'}0.00`;
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: selectedFiat,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const calculateTotalBalance = () => {
    if (selectedCrypto === "ALL") {
      // Calculate total balance across all currencies
      return (
        wallets?.reduce((total, wallet) => {
          const priceData = prices.find((p) => p.currency === wallet.currency);
          const price = priceData ? parseFloat(priceData.value) : 0; // Default to 0 if price not found
          const balance = parseFloat(wallet.balance.availableBalance); // Convert balance to number

          return total + balance * price; // Convert to total balance in base currency
        }, 0) || 0
      );
    } else {
      // Get balance for the selected crypto wallet
      const wallet = wallets.find((w) => w.currency === selectedCrypto);
      const price =
        parseFloat(prices.find((p) => p.currency === selectedCrypto)?.value) ||
        0;
      return (parseFloat(wallet?.balance.availableBalance) || 0) * price;
    }
  };

  const handlePortfolioClick = () => {
    navigate("/portfolio", { state: { selectedCrypto } });
  };

  const handleToggleBalance = async () => {
    // Prevent multiple simultaneous verification attempts
    if (isVerifying) return;

    // If we're trying to show the balance and passkey hasn't been verified yet
    if (!showBalance && !isPasskeyVerified) {
      try {
        const verified = await verifyPasskey();
        if (verified) {
          setShowBalance(true);
        }
      } catch (error) {
        toast({
          title: "Authentication Failed",
          description: "Unable to verify your identity",
          variant: "destructive",
        });
      }
    } else {
      // If passkey is already verified or we're hiding the balance
      setShowBalance(!showBalance);
    }
  };

  const handleCheckoutClick = () => {
    setCheckoutDialogOpen(true);
  };

  const handleEarnButtonClick = () => {
    setEarnDialogOpen(true);
  };

  const handleWalletConnect = (address: string, name?: string, provider?: any) => {
    setConnectedWallet(address);
    setWalletProvider(provider);
    toast({
      title: "Wallet Connected",
      description: `Connected to ${name || address.slice(0, 6) + "..." + address.slice(-4)}`,
    });
    setWalletDialogOpen(false);
  };

  const handleCheckoutComplete = () => {
    // Refresh wallet data after checkout
    if (user || merchant) {
      ApiService.updateDashboard({
        email: user?.email || merchant?.email || "",
        phone: user?.phone || merchant?.phone || "",
        basePair: selectedFiat,
        isMerchant: merchant ? "true" : "false",
      });
    }
  };

  const refreshStakingAssets = async () => {
    // Reload staking assets after transactions
    if (connectedWallet && walletProvider) {
      try {
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const stakingInfo = await StakingService.getStakingInfo(provider, connectedWallet);
        
        // Update staking assets with fresh data
        setStakingAssets([
          {
            symbol: stakingInfo.tokenSymbol,
            name: stakingInfo.tokenName,
            balance: stakingInfo.tokenBalance,
            apy: stakingInfo.apy,
            decimals: stakingInfo.tokenDecimals
          }
        ]);
      } catch (error) {
        console.error("Error refreshing staking assets:", error);
      }
    }
  };

  const greetName = user?.firstName || merchant?.merchantName || "";
  const merchantNo = merchant?.merchantNo;

  const greeting = (name?: string): string => {
    // East Africa Time (EAT) is UTC+3, no daylight savings
    const now = new Date();
    const hours = now.getUTCHours() + 3; // Convert UTC time to EAT

    if (hours >= 5 && hours < 12) {
      return `Good morning, ${name}!`;
    } else if (hours >= 12 && hours < 18) {
      return `Good afternoon, ${name}!`;
    } else {
      return `Good evening, ${name}!`;
    }
  };

  return (
    <GlassCard className="relative animate-scale-in p-2 sm:p-3">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      ) : (
        <div className="flex flex-col gap-1 sm:gap-2">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-semibold">
                {greeting(greetName)}
              </h1>
              <div className="mt-1">
                <IdentityDisplay compact={true} />
              </div>
            </div>
            <button
              onClick={handleToggleBalance}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isVerifying}
            >
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {merchant && merchantNo && (
            <p className="text-xs text-muted-foreground -mt-1">
              Merchant No: {merchantNo}
            </p>
          )}

          <h2 className="text-sm sm:text-base font-medium mt-1">
            Available Balance:
          </h2>

          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <Select value={selectedCrypto} onValueChange={handleSelectCrypto}>
              <SelectTrigger className="w-full sm:w-[100px] h-7 sm:h-8 text-xs">
                <SelectValue placeholder="Select Wallet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Wallets</SelectItem>
                {cryptoCurrencies.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    {crypto.name} ({crypto.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFiat} onValueChange={handleSelectFiat}>
              <SelectTrigger className="w-full sm:w-[100px] h-7 sm:h-8 text-xs">
                <SelectValue placeholder="Select Fiat" />
              </SelectTrigger>
              <SelectContent>
                {fiatCurrencies.map((fiat) => (
                  <SelectItem key={fiat.code} value={fiat.code}>
                    {fiat.name} ({fiat.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className={`text-xl sm:text-2xl font-bold my-1 ${
              !showBalance ? "blur-content" : ""
            }`}
          >
            {formatPrice(calculateTotalBalance())}
          </div>

          <div className="flex flex-wrap gap-1 items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <span className={!showBalance ? "blur-content" : ""}>
                {selectedCrypto === "ALL"
                  ? "Total balance across all wallets"
                  : `1 ${selectedCryptoData?.symbol} = ${formatPrice(
                      Number(selectedCryptoPrice?.value) || 0
                    )}`}
              </span>

              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  • Updated{" "}
                  {new Date(lastUpdated).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              {selectedCryptoPrice && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center">
                      <Badge
                        variant="secondary"
                        className="max-w-fit text-xs h-5 px-1"
                      >
                        <span
                          className={
                            getPriceChangeByPeriod(selectedTimePeriod) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {getPriceChangeByPeriod(selectedTimePeriod) >= 0 ? "+" : ""}
                          {getPriceChangeByPeriod(selectedTimePeriod).toFixed(2)}% {selectedTimePeriod}
                        </span>
                      </Badge>
                      <ChevronDown className="h-3 w-3 ml-0.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(["1h", "6h", "12h", "24h", "7d", "30d", "12m"] as TimePeriod[]).map((period) => {
                      const changeValue = getPriceChangeByPeriod(period);
                      // Handle NaN values
                      const displayValue = isNaN(changeValue) ? "0.00" : changeValue.toFixed(2);
                      const isPositive = !isNaN(changeValue) && changeValue >= 0;
                      
                      return (
                        <DropdownMenuItem 
                          key={period}
                          onClick={() => handleSelectTimePeriod(period)}
                          className={selectedTimePeriod === period ? "bg-accent" : ""}
                        >
                          <span className="mr-2">{period}</span>
                          <span
                            className={isPositive ? "text-green-500" : "text-red-500"}
                          >
                            {isPositive ? "+" : ""}{displayValue}%
                          </span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <div className="flex flex-wrap gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCheckoutClick} 
                  className="text-xs h-7 px-3 py-0 bg-[#0052FF] hover:bg-[#0039B3] text-white border-0"
                >
                  Fund Wallet
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEarnButtonClick} 
                  className="text-xs h-7 px-3 py-0 bg-green-600 hover:bg-green-700 text-white border-0"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Stake to Earn
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePortfolioClick}
                  className="text-xs h-7 px-3 py-0"
                >
                  See Portfolio
                </Button>
              </div>
            </div>
          </div>
          
          {/* Checkout Dialog */}
          <CheckoutDialog
            open={checkoutDialogOpen}
            onOpenChange={setCheckoutDialogOpen}
            onCheckoutComplete={handleCheckoutComplete}
          />

          {/* Staking (Earn) Dialog */}
          <Dialog open={earnDialogOpen} onOpenChange={setEarnDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Stake to Earn</DialogTitle>
                <DialogDescription>
                  Stake your assets to earn passive income
                </DialogDescription>
              </DialogHeader>
              
              {connectedWallet ? (
                <div className="mt-2 space-y-4">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>Connected wallet:</span> <IdentityDisplay address={connectedWallet} compact={true} showCopy={false} showDisconnect={false} />
                  </p>
                  
                  <Earn 
                    walletAddress={connectedWallet}
                    walletProvider={walletProvider}
                    stakingAssets={stakingAssets}
                    onRefresh={refreshStakingAssets}
                  />
                </div>
              ) : (
                <div className="mt-4 text-center">
                  <p className="mb-4">Connect a DeFi wallet to access staking features</p>
                  <WalletConnector onConnect={handleWalletConnect} />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </GlassCard>
  );
};

export default BalanceCard;
