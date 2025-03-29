
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useSendPay } from "@/contexts/SendPayContext";
import { cryptoCurrencies, fiatCurrencies } from "@/types/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AmountInput = () => {
  const { 
    setMobileAmount,
    selectedCryptoCurrency,
    setSelectedCryptoCurrency,
    selectedFiatCurrency,
    setSelectedFiatCurrency,
    isCryptoAmount,
    setIsCryptoAmount,
    convertCryptoToFiat,
    convertFiatToCrypto,
    rates,
    isLoading
  } = useSendPay();
  
  const [localAmount, setLocalAmount] = useState("");
  
  // Handle amount changes for conversions
  useEffect(() => {
    if (localAmount && !isLoading) {
      if (isCryptoAmount) {
        setMobileAmount(localAmount);
      } else {
        const cryptoAmount = convertFiatToCrypto(
          localAmount,
          selectedCryptoCurrency,
          selectedFiatCurrency
        );
        setMobileAmount(cryptoAmount);
      }
    } else {
      setMobileAmount("");
    }
  }, [localAmount, isCryptoAmount, selectedCryptoCurrency, selectedFiatCurrency, rates, isLoading, setMobileAmount, convertFiatToCrypto]);
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Select
          value={isCryptoAmount ? "crypto" : "fiat"}
          onValueChange={(value) => setIsCryptoAmount(value === "crypto")}
          defaultValue="fiat"
        >
          <SelectTrigger className="w-[90px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="fiat">Fiat</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          type="number"
          placeholder={`Enter amount in ${isCryptoAmount ? selectedCryptoCurrency : selectedFiatCurrency}`}
          value={localAmount}
          onChange={(e) => setLocalAmount(e.target.value)}
          required
          className="flex-grow"
        />
        
        <Select
          value={isCryptoAmount ? selectedCryptoCurrency : selectedFiatCurrency}
          onValueChange={(value) => {
            if (isCryptoAmount) {
              setSelectedCryptoCurrency(value);
            } else {
              setSelectedFiatCurrency(value);
            }
          }}
        >
          <SelectTrigger className="w-[90px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {isCryptoAmount ? 
              cryptoCurrencies.map((crypto) => (
                <SelectItem key={crypto.symbol} value={crypto.symbol}>
                  {crypto.symbol}
                </SelectItem>
              )) : 
              fiatCurrencies.map((fiat) => (
                <SelectItem key={fiat.code} value={fiat.code}>
                  {fiat.code}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      
      {localAmount && (
        <div className="text-sm bg-white/10 p-3 rounded-lg">
          {isCryptoAmount ? (
            <p className="text-emerald-400">
              ≈ {convertCryptoToFiat(localAmount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedFiatCurrency}
              <span className="block text-xs text-blue-300 mt-1">
                1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || '0.00'} {selectedFiatCurrency}
              </span>
            </p>
          ) : (
            <p className="text-emerald-400">
              ≈ {convertFiatToCrypto(localAmount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedCryptoCurrency}
              <span className="block text-xs text-blue-300 mt-1">
                1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || '0.00'} {selectedFiatCurrency}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AmountInput;
