
import { useState, useEffect } from "react";
import { cryptoCurrencies, fiatCurrencies } from "@/types/currency";
import { CurrencyRates } from "./types";

export const useCurrencyConversion = () => {
  const [rates, setRates] = useState<CurrencyRates>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch exchange rates (simulated here, would use real API in production)
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        const newRates: CurrencyRates = {};
        
        // Generate rates for all crypto-fiat pairs
        cryptoCurrencies.forEach(crypto => {
          fiatCurrencies.forEach(fiat => {
            // Base rates for different cryptocurrencies
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
            
            // Multipliers for different fiat currencies
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
  const convertCryptoToFiat = (
    cryptoAmount: string,
    cryptoCurrency: string,
    fiatCurrency: string
  ): string => {
    const amount = parseFloat(cryptoAmount) || 0;
    const rate = rates[`${cryptoCurrency}-${fiatCurrency}`] || 0;
    return (amount * rate).toFixed(2);
  };
  
  const convertFiatToCrypto = (
    fiatAmount: string,
    cryptoCurrency: string,
    fiatCurrency: string
  ): string => {
    const amount = parseFloat(fiatAmount) || 0;
    const rate = rates[`${cryptoCurrency}-${fiatCurrency}`] || 1;
    // For crypto, show more decimal places
    return (amount / rate).toFixed(8);
  };
  
  const getCurrentRate = (
    cryptoCurrency: string,
    fiatCurrency: string
  ): string => {
    const rate = rates[`${cryptoCurrency}-${fiatCurrency}`] || 0;
    return rate.toFixed(2);
  };

  return {
    rates,
    isLoading,
    convertCryptoToFiat,
    convertFiatToCrypto,
    getCurrentRate
  };
};
