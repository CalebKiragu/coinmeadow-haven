
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSendPay } from "@/contexts/SendPayContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cryptoCurrencies, fiatCurrencies } from "@/types/currency";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const MerchantPayment = ({
  currentStep,
}: {
  currentStep: number;
}) => {
  const { toast } = useToast();
  const { 
    merchantNumber, 
    setMerchantNumber,
    merchantAmount,
    setMerchantAmount,
    merchantPin,
    setMerchantPin,
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
  const [isValid, setIsValid] = useState(false);

  // Validate merchant number input (should be 6 digits)
  useEffect(() => {
    setIsValid(/^\d{6}$/.test(merchantNumber));
  }, [merchantNumber]);

  // Handle amount changes for conversions
  useEffect(() => {
    if (localAmount && !isLoading) {
      if (isCryptoAmount) {
        setMerchantAmount(localAmount);
      } else {
        const cryptoAmount = convertFiatToCrypto(
          localAmount,
          selectedCryptoCurrency,
          selectedFiatCurrency
        );
        setMerchantAmount(cryptoAmount);
      }
    }
  }, [localAmount, isCryptoAmount, selectedCryptoCurrency, selectedFiatCurrency, rates]);

  const handleQrScan = () => {
    toast({
      title: "QR Scanner",
      description: "QR scanning feature coming soon!",
    });
  };

  if (currentStep === 1) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter 6-digit merchant number"
            value={merchantNumber}
            onChange={(e) => setMerchantNumber(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
            className={`pr-14 ${!isValid && merchantNumber ? 'border-red-500' : ''}`}
            required
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={handleQrScan}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
        {!isValid && merchantNumber && (
          <p className="text-xs text-red-500">Enter a valid 6-digit merchant number</p>
        )}
      </div>
    );
  }
  
  if (currentStep === 2) {
    return (
      <div className="space-y-4 animate-fade-in">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="flex gap-2 items-center">
              <Select
                value={isCryptoAmount ? "crypto" : "fiat"}
                onValueChange={(value) => setIsCryptoAmount(value === "crypto")}
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
              <div className="text-sm bg-white/10 p-2 rounded-lg">
                {isCryptoAmount ? (
                  <p>
                    ≈ {convertCryptoToFiat(localAmount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedFiatCurrency}
                    <span className="block text-xs text-gray-400 mt-1">
                      1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || '0.00'} {selectedFiatCurrency}
                    </span>
                  </p>
                ) : (
                  <p>
                    ≈ {convertFiatToCrypto(localAmount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedCryptoCurrency}
                    <span className="block text-xs text-gray-400 mt-1">
                      1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || '0.00'} {selectedFiatCurrency}
                    </span>
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
  
  if (currentStep === 3) {
    const fiatEquivalent = convertCryptoToFiat(
      merchantAmount,
      selectedCryptoCurrency,
      selectedFiatCurrency
    );
    
    return (
      <div className="space-y-4 animate-fade-in">
        <Input
          type="password"
          placeholder="Enter PIN"
          value={merchantPin}
          onChange={(e) => setMerchantPin(e.target.value)}
          maxLength={4}
          required
        />
      </div>
    );
  }

  return null;
};
