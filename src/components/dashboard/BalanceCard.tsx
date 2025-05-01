import { useState, useEffect } from "react";
import { Checkout, CheckoutButton } from "@coinbase/onchainkit/checkout";
import { Eye, EyeOff } from "lucide-react";
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

interface BalanceCardProps {
  showBalance: boolean;
  setShowBalance: (value: boolean) => void;
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

  const handleSelectCrypto = (value: string) => {
    dispatch(setSelectedCrypto(value));
  };

  const handleSelectFiat = (value: string) => {
    dispatch(setSelectedFiat(value as Currency));
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

  const formatPrice = (price: number) => {
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

  const chargeHandler = async () => {
    const chargeData = {
      amount: "1",
      currency: "USDC",
      orderId: "575b7bef-fcc9-4765-87c8-96cf5f845b85",
      type: "fixed_price",
    };
    const response = await ApiService.createCharge(chargeData);
    const { id } = response;
    return id; // Return charge ID
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
            <h1 className="text-base sm:text-lg font-semibold">
              {greeting(greetName)}
            </h1>
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
                <Badge
                  variant="secondary"
                  className="max-w-fit text-xs h-5 px-1"
                >
                  <span
                    className={
                      Number(selectedCryptoPrice.value) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {Number(selectedCryptoPrice.value) >= 0 ? "+" : ""}
                    {Number(selectedCryptoPrice.value).toFixed(2)}% today
                  </span>
                </Badge>
              )}

              <div>
                <Checkout chargeHandler={chargeHandler}>
                  <CheckoutButton text="Fund Wallet" />
                </Checkout>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePortfolioClick}
                  className="text-xs h-6 px-2 py-0"
                >
                  See Portfolio
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default BalanceCard;
