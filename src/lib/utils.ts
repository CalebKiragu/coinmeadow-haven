
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTimestamp = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

export const formatCryptoValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "0";
  
  try {
    let numValue: number;
    
    if (typeof value === "string") {
      // Handle scientific notation
      if (value.includes('e')) {
        const [base, exponent] = value.split('e');
        numValue = parseFloat(base) * Math.pow(10, parseInt(exponent));
      } else {
        numValue = parseFloat(value);
      }
    } else {
      numValue = value;
    }
    
    if (isNaN(numValue)) return "0";
    
    // Format based on the size of the number
    if (numValue < 0.000001) {
      // Very small numbers - show in scientific notation with 8 significant digits
      return numValue.toExponential(6);
    } else if (numValue < 0.01) {
      // Small numbers - show more decimal places
      return numValue.toFixed(8);
    } else if (numValue < 1) {
      // Medium small numbers
      return numValue.toFixed(6);
    } else if (numValue < 1000) {
      // Regular numbers
      return numValue.toFixed(4);
    } else {
      // Large numbers
      return numValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  } catch (error) {
    console.error("Error formatting crypto value:", error);
    return "0";
  }
};

// Function to estimate fiat value from crypto amount
export const estimateFiatValue = (
  amount: string | number,
  cryptoCurrency: string,
  fiatCurrency: string,
  rates: Record<string, number>
): string => {
  try {
    let numAmount: number;
    
    if (typeof amount === "string") {
      // Handle scientific notation
      if (amount.includes('e')) {
        const [base, exponent] = amount.split('e');
        numAmount = parseFloat(base) * Math.pow(10, parseInt(exponent));
      } else {
        numAmount = parseFloat(amount);
      }
    } else {
      numAmount = amount;
    }
    
    if (isNaN(numAmount)) return "";
    
    const rateKey = `${cryptoCurrency}-${fiatCurrency}`;
    const rate = rates[rateKey];
    
    if (!rate) return "";
    
    const fiatValue = numAmount * rate;
    
    return fiatValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch (error) {
    console.error("Error estimating fiat value:", error);
    return "";
  }
};

// Mask sensitive data like email or phone
export const maskSensitiveData = (data?: string): string => {
  if (!data) return "***";
  
  if (data.includes('@')) {
    // Email masking
    const [username, domain] = data.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  } else if (/^\d+$/.test(data)) {
    // Phone number masking
    return data.slice(0, 3) + '*'.repeat(data.length - 6) + data.slice(-3);
  } else {
    // Default masking for other types
    return data.charAt(0) + '*'.repeat(data.length - 2) + data.charAt(data.length - 1);
  }
};

// URL configuration for API endpoints
export const url = () => {
  const environment = import.meta.env.VITE_APP_ENV || 'development';
  
  const urls = {
    development: {
      BASE_URL: 'https://api-dev.example.com/',
    },
    staging: {
      BASE_URL: 'https://api-staging.example.com/',
    },
    production: {
      BASE_URL: 'https://api.example.com/',
    },
  };
  
  return urls[environment as keyof typeof urls] || urls.development;
};

// AWS configuration
export const aws = () => {
  return {
    s3: {
      REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      BUCKET_NAME: import.meta.env.VITE_S3_BUCKET_NAME || 'pesatoken-kyc',
      IDENTITY_POOL_ID: import.meta.env.VITE_IDENTITY_POOL_ID || 'us-east-1:12345678-1234-1234-1234-123456789012'
    }
  };
};
