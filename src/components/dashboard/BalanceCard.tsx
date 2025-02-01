import { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
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

const BalanceCard = ({ showBalance, setShowBalance }) => {
  const navigate = useNavigate();
  const [selectedCrypto, setSelectedCrypto] = useState("ALL");
  const [selectedFiat, setSelectedFiat] = useState("USD");

  const selectedCryptoData = cryptoCurrencies.find(
    (c) => c.symbol === selectedCrypto
  );
  const selectedFiatData = fiatCurrencies.find((f) => f.code === selectedFiat);

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
      return cryptoCurrencies.reduce(
        (total, crypto) => total + (crypto.price || 0),
        0
      );
    }
    return selectedCryptoData?.price || 0;
  };

  const handlePortfolioClick = () => {
    navigate("/portfolio", { state: { selectedCrypto } });
  };

  return (
    <GlassCard className="relative animate-scale-in">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-xl font-semibold">Available Balance:</h2>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
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

          <Select value={selectedFiat} onValueChange={setSelectedFiat}>
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
          {formatPrice(calculateTotalBalance())}
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
                {formatPrice(selectedCryptoData?.price || 0)}
              </span>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="max-w-fit">
                <span className="text-green-500">+2.5% today</span>
              </Badge>
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
      </div>
    </GlassCard>
  );
};

export default BalanceCard;