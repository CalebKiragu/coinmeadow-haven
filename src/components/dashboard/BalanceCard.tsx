import { useState, useEffect } from "react";
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
} from "@/lib/redux/slices/walletSlice";
import { ApiService } from "@/lib/service";

const BalanceCard = ({ showBalance, setShowBalance }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { prices } = useAppSelector((state) => state.price);
  const { user, merchant } = useAppSelector((state) => state.auth);
  const { wallets, selectedCrypto, selectedFiat, lastUpdated } = useAppSelector(
    (state) => state.wallet
  );

  const [isLoading, setIsLoading] = useState(false);

  // Fetch wallet data when component mounts
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
  }, [user, merchant]);

  const handleSelectCrypto = (value: string) => {
    dispatch(setSelectedCrypto(value));
  };

  const handleSelectFiat = (value: string) => {
    dispatch(setSelectedFiat(value));
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
      return wallets.reduce((total, wallet) => {
        const priceData = prices.find((p) => p.currency === wallet.currency);
        const price = priceData ? parseFloat(priceData.value) : 0; // Default to 0 if price not found
        const balance = parseFloat(wallet.balance.availableBalance); // Convert balance to number

        return total + balance * price; // Convert to total balance in base currency
      }, 0);
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
    <GlassCard className="relative animate-scale-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">{greeting(greetName)}</h1>
              {merchant && merchant.merchantNo && (
                <p className="text-sm text-muted-foreground">
                  Merchant No: {merchantNo}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <h2 className="text-lg font-medium mt-2">Available Balance:</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedCrypto} onValueChange={handleSelectCrypto}>
            <SelectTrigger className="w-full sm:w-[140px]">
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
            <SelectTrigger className="w-full sm:w-[140px]">
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
          className={`text-3xl font-bold mb-2 ${
            !showBalance ? "blur-content" : ""
          }`}
        >
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            formatPrice(calculateTotalBalance())
          )}
        </div>

        <div
          className={`text-sm text-gray-600 ${
            !showBalance ? "blur-content" : ""
          }`}
        >
          <div className="flex flex-col gap-1">
            {selectedCrypto === "ALL" ? (
              <span>Total balance across all wallets</span>
            ) : (
              <span className="break-words">
                1 {selectedCryptoData?.symbol} ={" "}
                {formatPrice(Number(selectedCryptoPrice?.value) || 0)}
              </span>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {selectedCryptoPrice && (
                <Badge variant="secondary" className="max-w-fit">
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
              <Button
                variant="outline"
                size="sm"
                onClick={handlePortfolioClick}
                className="ml-auto"
              >
                See Portfolio
              </Button>
            </div>
          </div>
        </div>

        {lastUpdated && (
          <div className="text-xs text-gray-500 mt-2">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default BalanceCard;
