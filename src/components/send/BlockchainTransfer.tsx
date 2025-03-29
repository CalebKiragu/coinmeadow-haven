
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useSendPay } from "@/contexts/SendPayContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cryptoCurrencies } from "@/types/currency";

export const BlockchainTransfer = ({
  currentStep,
}: {
  currentStep: number;
}) => {
  const { 
    blockchainAddress,
    setBlockchainAddress,
    blockchainAmount,
    setBlockchainAmount,
    blockchainPin,
    setBlockchainPin,
    selectedCryptoCurrency,
    setSelectedCryptoCurrency,
    convertCryptoToFiat,
    selectedFiatCurrency,
    rates
  } = useSendPay();
  
  const [isAddressValid, setIsAddressValid] = useState(false);
  
  // Basic validation for blockchain address
  useEffect(() => {
    // This is a very basic validation - in a real app, this would be more sophisticated
    setIsAddressValid(blockchainAddress.length > 25);
  }, [blockchainAddress]);
  
  if (currentStep === 1) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Input
          type="text"
          placeholder="Enter blockchain address"
          value={blockchainAddress}
          onChange={(e) => setBlockchainAddress(e.target.value)}
          className={`${!isAddressValid && blockchainAddress ? 'border-red-500' : ''}`}
          required
        />
        {!isAddressValid && blockchainAddress && (
          <p className="text-xs text-red-500 mt-1">Please enter a valid blockchain address</p>
        )}
      </div>
    );
  }
  
  if (currentStep === 2) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder={`Enter amount in ${selectedCryptoCurrency}`}
            value={blockchainAmount}
            onChange={(e) => setBlockchainAmount(e.target.value)}
            required
            className="flex-grow"
          />
          
          <Select
            value={selectedCryptoCurrency}
            onValueChange={setSelectedCryptoCurrency}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cryptoCurrencies.map((crypto) => (
                <SelectItem key={crypto.symbol} value={crypto.symbol}>
                  {crypto.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {blockchainAmount && (
          <div className="text-sm bg-white/10 p-3 rounded-lg">
            <p className="text-emerald-400">
              ≈ {convertCryptoToFiat(blockchainAmount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedFiatCurrency}
              <span className="block text-xs text-blue-300 mt-1">
                1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || '0.00'} {selectedFiatCurrency}
              </span>
            </p>
          </div>
        )}
      </div>
    );
  }
  
  if (currentStep === 3) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Input
          type="password"
          placeholder="Enter PIN"
          value={blockchainPin}
          onChange={(e) => setBlockchainPin(e.target.value)}
          maxLength={4}
          required
        />
      </div>
    );
  }

  return null;
};
