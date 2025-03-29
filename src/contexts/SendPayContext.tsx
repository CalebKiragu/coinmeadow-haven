
import { createContext, useContext, useState } from "react";
import { useCurrencyConversion } from "./sendpay/useCurrencyConversion";
import { CurrencyRates } from "./sendpay/types";

// Context type definition
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
  
  // Blockchain transfer
  blockchainMode: boolean;
  setBlockchainMode: (value: boolean) => void;
  blockchainAddress: string;
  setBlockchainAddress: (value: string) => void;
  blockchainAmount: string;
  setBlockchainAmount: (value: string) => void;
  blockchainPin: string;
  setBlockchainPin: (value: string) => void;
  
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
  resetBlockchainFlow: () => void;
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
  
  // Blockchain transfer state
  const [blockchainMode, setBlockchainMode] = useState(false);
  const [blockchainAddress, setBlockchainAddress] = useState("");
  const [blockchainAmount, setBlockchainAmount] = useState("");
  const [blockchainPin, setBlockchainPin] = useState("");
  
  // Currency settings
  const [selectedCryptoCurrency, setSelectedCryptoCurrency] = useState("BTC");
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState("USD");
  const [isCryptoAmount, setIsCryptoAmount] = useState(false); // Default to fiat
  
  // Country code for phone input
  const [selectedCountryCode, setSelectedCountryCode] = useState("254"); // Kenya by default
  
  // Use our currency conversion hook
  const { 
    rates, 
    isLoading, 
    convertCryptoToFiat, 
    convertFiatToCrypto, 
    getCurrentRate 
  } = useCurrencyConversion();

  // Reset functions
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
  
  const resetBlockchainFlow = () => {
    setBlockchainAddress("");
    setBlockchainAmount("");
    setBlockchainPin("");
    setBlockchainMode(false);
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
        blockchainMode,
        setBlockchainMode,
        blockchainAddress,
        setBlockchainAddress,
        blockchainAmount,
        setBlockchainAmount,
        blockchainPin,
        setBlockchainPin,
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
        resetBlockchainFlow,
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
