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

// Format a bigint timestamp to a human-readable date string
export const formatTimestamp = (timestamp: bigint): string => {
  try {
    // Convert BigInt to number safely 
    const dateNumber = Number(timestamp);
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
    console.error("Error formatting timestamp:", error);
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
