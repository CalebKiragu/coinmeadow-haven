
import axios from "axios";
import { updatePrice, PriceData } from "../redux/slices/priceSlice";
import { store } from "../redux/store";
import { fiatCurrencies } from "@/types/currency";

// The API key for forex rates
const APP_ID = "63f6a0fbc67a4379ae17ec2e4fbd1fda";

// Cache storage
const CACHE_KEY = 'forex_rates_cache';
const CACHE_EXPIRY_TIME = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

interface ForexRatesCache {
  rates: { [currency: string]: number };
  timestamp: number;
}

export const RateService = {
  // Get cached forex rates
  getCachedRates: (): ForexRatesCache | null => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (!cachedData) return null;
      
      const parsedData: ForexRatesCache = JSON.parse(cachedData);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - parsedData.timestamp > CACHE_EXPIRY_TIME) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return parsedData;
    } catch (error) {
      console.error("Error retrieving cached forex rates:", error);
      return null;
    }
  },
  
  // Cache forex rates
  cacheRates: (rates: { [currency: string]: number }) => {
    try {
      const cacheData: ForexRatesCache = {
        rates,
        timestamp: Date.now()
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error caching forex rates:", error);
    }
  },
  
  // Fetch forex rates from API
  fetchForexRates: async (): Promise<{ [currency: string]: number }> => {
    // First check if we have cached rates
    const cachedRates = RateService.getCachedRates();
    if (cachedRates) {
      console.log("Using cached forex rates");
      return cachedRates.rates;
    }
    
    // Prepare symbols list from fiatCurrencies
    const symbols = fiatCurrencies.map(fiat => fiat.code).join(',');
    
    try {
      console.log("Fetching fresh forex rates");
      const response = await axios.get(
        `https://openexchangerates.org/api/latest.json?app_id=${APP_ID}&symbols=${symbols}`
      );
      
      if (response.data && response.data.rates) {
        // Cache the rates
        RateService.cacheRates(response.data.rates);
        return response.data.rates;
      }
      
      throw new Error("Invalid response from forex API");
    } catch (error) {
      console.error("Error fetching forex rates:", error);
      throw error;
    }
  },
  
  // Update price store with forex rates
  updateForexRates: async (): Promise<void> => {
    try {
      const rates = await RateService.fetchForexRates();
      
      // Convert the rates to the format expected by the store
      Object.entries(rates).forEach(([currency, rate]) => {
        const priceData: PriceData = {
          basePair: 'USD',
          source: 'openexchangerates',
          timestamp: Date.now(), // Use number instead of BigInt
          value: rate.toString(),
          date: new Date().toISOString(),
          currency,
          batchId: 'forex-' + Date.now()
        };
        
        store.dispatch(updatePrice(priceData));
      });
    } catch (error) {
      console.error("Failed to update forex rates:", error);
    }
  }
};

// Initialize rates when the module is loaded
RateService.updateForexRates().catch(console.error);
