
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AWS_KEYS {
  ACCESS_KEY_ID?: string;
  SECRET_ACCESS_KEY?: string;
  REGION?: string;
  BUCKET_NAME?: string;
  IDENTITY_POOL_ID?: string;
}

export function aws(): {
  s3?: AWS_KEYS;
  ses?: AWS_KEYS;
} {
  return {
    s3: {
      REGION: "us-east-1",
      BUCKET_NAME: "pesatoken-kyc",
      IDENTITY_POOL_ID: "us-east-1:539c38cd-87a4-4563-bb9e-16e23aa013f5",
    },
  };
}

export function url(): {
  BASE_URL?: string;
  CHAIN_URL?: string;
  AUTH_URL?: string;
} {
  return {
    BASE_URL:
      import.meta.env.VITE_API_BASE_URL ||
      `https://nnjjyk2mlf.execute-api.us-east-1.amazonaws.com/Prod/`,
    CHAIN_URL:
      import.meta.env.VITE_CHAIN_URL ||
      `https://a07cchvfjd.execute-api.us-east-1.amazonaws.com/Prod/`,
    AUTH_URL:
      import.meta.env.VITE_AUTH_URL ||
      `https://en7qgbgo6d.execute-api.us-east-1.amazonaws.com/Prod/`,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format crypto values to avoid scientific notation for small numbers
export function formatCryptoValue(value: string | number): string {
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return "0";
    
    // Extremely small values (less than 0.000001)
    if (Math.abs(numValue) < 0.000001 && numValue !== 0) {
      return numValue.toFixed(10).replace(/\.?0+$/, "");
    }
    
    // Small values (less than 0.01)
    if (Math.abs(numValue) < 0.01 && numValue !== 0) {
      return numValue.toFixed(8).replace(/\.?0+$/, "");
    }
    
    // Medium values (less than 1000)
    if (Math.abs(numValue) < 1000) {
      return numValue.toFixed(6).replace(/\.?0+$/, "");
    }
    
    // Large values
    return numValue.toLocaleString('en-US', {
      maximumFractionDigits: 2
    });
  } catch (error) {
    console.error("Error formatting crypto value:", error);
    return String(value);
  }
}

// Format a bigint timestamp to a human-readable date string with improved error handling
export const formatTimestamp = (timestamp: bigint | number | string | undefined | null): string => {
  try {
    if (timestamp === undefined || timestamp === null) {
      return "Invalid date";
    }
    
    // Convert to number if needed
    let dateNumber: number;
    if (typeof timestamp === 'bigint') {
      // Safely convert BigInt to number
      dateNumber = Number(timestamp);
    } else if (typeof timestamp === 'string') {
      dateNumber = parseInt(timestamp, 10);
    } else {
      dateNumber = timestamp;
    }
    
    if (isNaN(dateNumber)) {
      console.error("Invalid timestamp format:", timestamp);
      return "Invalid date";
    }
    
    const date = new Date(dateNumber);
    if (isNaN(date.getTime())) {
      console.error("Invalid date from timestamp:", timestamp);
      return "Invalid date";
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error, typeof timestamp);
    return "Error formatting date";
  }
};

export function maskSensitiveData(value: string | null): string | null {
  if (!value) return "N/A";
  if (value.includes("@")) {
    const [user, domain] = value.split("@");
    return `${user.slice(0, 3)}***@${domain}`;
  }
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

// Function to estimate fiat value of cryptocurrency
export function estimateFiatValue(
  cryptoAmount: string,
  cryptoCurrency: string,
  fiatCurrency = "USD",
  rates: any = {} // Will use redux store rates
): string {
  try {
    const amount = parseFloat(cryptoAmount);
    if (isNaN(amount)) return "";
    
    // Default rates if we can't find in the store
    const defaultRates: Record<string, number> = {
      "BTC-USD": 65000,
      "ETH-USD": 3500,
      "LTC-USD": 85,
      "CELO-USD": 0.95,
      "BTC-EUR": 60000,
      "ETH-EUR": 3200,
      "LTC-EUR": 78,
      "CELO-EUR": 0.87,
      "BTC-KES": 8450000,
      "ETH-KES": 455000,
      "LTC-KES": 11050,
      "CELO-KES": 124,
    };
    
    // Try to get rate from rates object, fallback to default
    const key = `${cryptoCurrency}-${fiatCurrency}`;
    const rate = rates[key] || defaultRates[key] || 0;
    
    if (!rate) return "";
    
    const fiatValue = amount * rate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: fiatCurrency,
      maximumFractionDigits: 2
    }).format(fiatValue);
  } catch (error) {
    console.error("Error estimating fiat value:", error);
    return "";
  }
}
