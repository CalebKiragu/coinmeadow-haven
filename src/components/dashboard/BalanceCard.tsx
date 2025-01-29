import { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GlassCard from "../ui/GlassCard";
import { Badge } from "../ui/badge";
import { cryptoCurrencies, fiatCurrencies } from "@/types/currency";

const BalanceCard = () => {
  const [showBalance, setShowBalance] = useState(false);
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

  return (
    <GlassCard className="relative animate-scale-in">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Available Balance:</h2>

        <div className="flex gap-4">
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger className="w-[140px]">
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
            <SelectTrigger className="w-[140px]">
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

        <button
          onClick={() => setShowBalance(!showBalance)}
          className="text-gray-600 hover:text-gray-800 transition-colors ml-2"
        >
          {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
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
            <span>
              1 {selectedCryptoData?.symbol} ={" "}
              {formatPrice(selectedCryptoData?.price || 0)}
            </span>
          )}

          <Badge variant="secondary" className="ml-2 max-w-fit">
            <span className="text-green-500">+2.5% today</span>
          </Badge>
        </div>
      </div>
    </GlassCard>
  );
};

export default BalanceCard;
