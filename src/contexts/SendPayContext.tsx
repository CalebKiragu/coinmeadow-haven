
import { createContext, useContext, useState, useEffect } from "react";
import { cryptoCurrencies, fiatCurrencies } from "@/types/currency";

type CurrencyRates = {
  [key: string]: number;
};

type SendPayContextType = {
  // Mobile transfer
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  mobileAmount: string;
  setMobileAmount: (value: string) => void;
  mobilePin: string;
  setMobilePin: (value: string) => void;
  mobileInputType: "phone" | "email";
  setMobileInputType: (value: "phone" | "email") => void;
  
  // Merchant payment
  merchantNumber: string;
  setMerchantNumber: (value: string) => void;
  merchantAmount: string;
  setMerchantAmount: (value: string) => void;
  merchantPin: string;
  setMerchantPin: (value: string) => void;
  
  // Currency settings
  selectedCryptoCurrency: string;
  setSelectedCryptoCurrency: (value: string) => void;
  selectedFiatCurrency: string;
  setSelectedFiatCurrency: (value: string) => void;
  isCryptoAmount: boolean;
  setIsCryptoAmount: (value: boolean) => void;
  
  // Country for phone input
  selectedCountryCode: string;
  setSelectedCountryCode: (value: string) => void;
  
  // Currency conversion helpers
  convertCryptoToFiat: (cryptoAmount: string, cryptoCurrency: string, fiatCurrency: string) => string;
  convertFiatToCrypto: (fiatAmount: string, cryptoCurrency: string, fiatCurrency: string) => string;
  getCurrentRate: (cryptoCurrency: string, fiatCurrency: string) => string;
  
  // State management
  resetMobileFlow: () => void;
  resetMerchantFlow: () => void;
  rates: CurrencyRates;
  isLoading: boolean;
};

const SendPayContext = createContext<SendPayContextType | undefined>(undefined);

export const SendPayProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Mobile transfer state
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileAmount, setMobileAmount] = useState("");
  const [mobilePin, setMobilePin] = useState("");
  const [mobileInputType, setMobileInputType] = useState<"phone" | "email">("phone");
  
  // Merchant payment state
  const [merchantNumber, setMerchantNumber] = useState("");
  const [merchantAmount, setMerchantAmount] = useState("");
  const [merchantPin, setMerchantPin] = useState("");
  
  // Currency settings
  const [selectedCryptoCurrency, setSelectedCryptoCurrency] = useState("BTC");
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState("USD");
  const [isCryptoAmount, setIsCryptoAmount] = useState(true);
  
  // Country code for phone input
  const [selectedCountryCode, setSelectedCountryCode] = useState("254"); // Kenya by default
  
  // Exchange rates simulation
  const [rates, setRates] = useState<CurrencyRates>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch exchange rates (simulated here, would use real API in production)
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      // In reality, this would be an API call
      // For now, we'll simulate with some fixed rates
      setTimeout(() => {
        const newRates: CurrencyRates = {};
        
        // Generate rates for all crypto-fiat pairs
        cryptoCurrencies.forEach(crypto => {
          fiatCurrencies.forEach(fiat => {
            // Generate a somewhat realistic exchange rate
            // These are just placeholders and should be replaced with real API data
            let baseRate = 0;
            switch (crypto.symbol) {
              case "BTC": baseRate = 65000; break;
              case "ETH": baseRate = 3500; break;
              case "USDT": baseRate = 1; break;
              case "USDC": baseRate = 1; break;
              case "LTC": baseRate = 85; break;
              case "BASE": baseRate = 0.95; break;
              default: baseRate = 1;
            }
            
            // Adjust for different fiat currencies
            let multiplier = 1;
            switch (fiat.code) {
              case "EUR": multiplier = 0.92; break;
              case "GBP": multiplier = 0.78; break;
              case "NGN": multiplier = 1500; break;
              case "KES": multiplier = 130; break;
              case "ZAR": multiplier = 18.5; break;
              case "UGX": multiplier = 3800; break;
              case "TSH": multiplier = 2600; break;
              case "RWF": multiplier = 1250; break;
              case "ETB": multiplier = 56; break;
              default: multiplier = 1;
            }
            
            const key = `${crypto.symbol}-${fiat.code}`;
            newRates[key] = baseRate * multiplier;
          });
        });
        
        setRates(newRates);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchRates();
    
    // Refresh rates every minute
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Currency conversion helpers
  const convertCryptoToFiat = (cryptoAmount: string, cryptoCurrency: string, fiatCurrency: string): string => {
    const amount = parseFloat(cryptoAmount) || 0;
    const rate = rates[`${cryptoCurrency}-${fiatCurrency}`] || 0;
    return (amount * rate).toFixed(2);
  };
  
  const convertFiatToCrypto = (fiatAmount: string, cryptoCurrency: string, fiatCurrency: string): string => {
    const amount = parseFloat(fiatAmount) || 0;
    const rate = rates[`${cryptoCurrency}-${fiatCurrency}`] || 1;
    // For crypto, show more decimal places
    return (amount / rate).toFixed(8);
  };
  
  const getCurrentRate = (cryptoCurrency: string, fiatCurrency: string): string => {
    const rate = rates[`${cryptoCurrency}-${fiatCurrency}`] || 0;
    return rate.toFixed(2);
  };

  const resetMobileFlow = () => {
    setMobileNumber("");
    setMobileAmount("");
    setMobilePin("");
  };

  const resetMerchantFlow = () => {
    setMerchantNumber("");
    setMerchantAmount("");
    setMerchantPin("");
  };

  return (
    <SendPayContext.Provider
      value={{
        mobileNumber,
        setMobileNumber,
        mobileAmount,
        setMobileAmount,
        mobilePin,
        setMobilePin,
        mobileInputType,
        setMobileInputType,
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
        selectedCountryCode,
        setSelectedCountryCode,
        convertCryptoToFiat,
        convertFiatToCrypto,
        getCurrentRate,
        resetMobileFlow,
        resetMerchantFlow,
        rates,
        isLoading,
      }}
    >
      {children}
    </SendPayContext.Provider>
  );
};

export const useSendPay = () => {
  const context = useContext(SendPayContext);
  if (context === undefined) {
    throw new Error("useSendPay must be used within a SendPayProvider");
  }
  return context;
};
