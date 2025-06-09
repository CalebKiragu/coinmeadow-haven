import { ClassValue, clsx } from "clsx";
import { base, baseSepolia } from "wagmi/chains"; // add baseSepolia for testing
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTimestamp = (timestamp: string): string => {
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

export const formatToCamelCase = (str: string, pascalCase = true): string => {
  const words = str
    .toLowerCase()
    .split(/[\s-_]+/)
    .filter(Boolean); // remove empty parts

  const formatted = words.map((word, index) => {
    if (index === 0 && !pascalCase) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return formatted.join("");
};

export const formatCryptoValue = (
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined) return "0";

  try {
    let numValue: number;

    if (typeof value === "string") {
      if (value.includes("e")) {
        const [base, exponent] = value.split("e");
        numValue = parseFloat(base) * Math.pow(10, parseInt(exponent));
      } else {
        numValue = parseFloat(value);
      }
    } else {
      numValue = value;
    }

    if (isNaN(numValue)) return "0";

    if (numValue < 0.000001) {
      return numValue.toExponential(6);
    } else if (numValue < 0.01) {
      return numValue.toFixed(8);
    } else if (numValue < 1) {
      return numValue.toFixed(6);
    } else if (numValue < 1000) {
      return numValue.toFixed(4);
    } else {
      return numValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  } catch (error) {
    console.error("Error formatting crypto value:", error);
    return "0";
  }
};

export const estimateFiatValue = (
  amount: string | number,
  cryptoCurrency: string,
  fiatCurrency: string,
  rates: Record<string, number>
): string => {
  try {
    let numAmount: number;

    if (typeof amount === "string") {
      if (amount.includes("e")) {
        const [base, exponent] = amount.split("e");
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

    // Always format fiat values with exactly 2 decimal places
    return fiatValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (error) {
    console.error("Error estimating fiat value:", error);
    return "";
  }
};

export const maskSensitiveData = (data?: string): string => {
  if (!data) return "***";

  if (data.includes("@")) {
    const [username, domain] = data.split("@");
    const maskedUsername =
      username.charAt(0) +
      "*".repeat(username.length - 2) +
      username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  } else if (/^\d+$/.test(data)) {
    return data.slice(0, 3) + "*".repeat(data.length - 6) + data.slice(-3);
  } else {
    return (
      data.charAt(0) +
      "*".repeat(data.length - 2) +
      data.charAt(data.length - 1)
    );
  }
};

export const url = () => {
  return {
    DEV_BASE_URL:
      "https://nnjjyk2mlf.execute-api.us-east-1.amazonaws.com/Prod/",
    PROD_BASE_URL: `https://qckp089yob.execute-api.us-east-1.amazonaws.com/Prod/`,
  };
};

export const aws = () => {
  return {
    s3: {
      REGION: import.meta.env.VITE_AWS_REGION || "us-east-1",
      BUCKET_NAME: import.meta.env.VITE_S3_BUCKET_NAME || "pesatoken-kyc-dev",
      IDENTITY_POOL_ID:
        import.meta.env.VITE_IDENTITY_POOL_ID ||
        "us-east-1:539c38cd-87a4-4563-bb9e-16e23aa013f5",
    },
  };
};

/**
 * Helper to handle environment branching for different deployment environments
 */
export const getEnvironmentConfig = () => {
  // const env = import.meta.env.VITE_APP_ENV || "production";
  const env = import.meta.env.VITE_APP_ENV || "development";

  const configs = {
    development: {
      currentEnv: env,
      apiUrl: "https://v8885hujef.execute-api.us-east-1.amazonaws.com/Prod/",
      aws: {
        s3: {
          REGION: "us-east-1",
          BUCKET_NAME: "pesatoken-kyc-dev",
          IDENTITY_POOL_ID: "us-east-1:539c38cd-87a4-4563-bb9e-16e23aa013f5",
        },
      },
      featureFlags: {
        enableBiometrics: true,
        showDebugInfo: true,
        mockTransactions: false,
      },
      base: baseSepolia,
      onchainkitKey: "XoXmoP3ZNKEN8GhfVU2zwrkHpZb7OAOp",
      agentAddress: "0x97143F6376CAA5647389D733D72b836444B0cf50",
      walletAddress: "0x859291D42bC0f9d3988209E3a4920a0E30D58016",
      googleScriptSrc: "https://accounts.google.com/gsi/client",
      googleClientId:
        "339887597881-dtj402e9975k4r8stoejgovj1me8gicn.apps.googleusercontent.com",
      baseSchemaId:
        "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9",
      baseVaultAddress: "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A",
      ETH_RPC_URL:
        "https://eth-sepolia.g.alchemy.com/v2/8Yz1ZLNi87s0MCcIL8s6jzoiLXfLhVSK",
      CHAIN_ID: 11155111, // sepolia chain_id
      BASE_CHAIN_ID: 84532,
    },
    staging: {
      currentEnv: env,
      apiUrl: "https://v8885hujef.execute-api.us-east-1.amazonaws.com/Prod/",
      aws: {
        s3: {
          REGION: "us-east-1",
          BUCKET_NAME: "pesatoken-kyc-dev",
          IDENTITY_POOL_ID: "us-east-1:539c38cd-87a4-4563-bb9e-16e23aa013f5",
        },
      },
      featureFlags: {
        enableBiometrics: true,
        showDebugInfo: false,
        mockTransactions: false,
      },
      base: baseSepolia,
      onchainkitKey: "XoXmoP3ZNKEN8GhfVU2zwrkHpZb7OAOp",
      agentAddress: "0x97143F6376CAA5647389D733D72b836444B0cf50",
      walletAddress: "0x859291D42bC0f9d3988209E3a4920a0E30D58016",
      googleScriptSrc: "https://accounts.google.com/gsi/client",
      googleClientId:
        "339887597881-dtj402e9975k4r8stoejgovj1me8gicn.apps.googleusercontent.com",
      baseSchemaId:
        "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9",
      baseVaultAddress: "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A",
      ETH_RPC_URL:
        "https://eth-sepolia.g.alchemy.com/v2/8Yz1ZLNi87s0MCcIL8s6jzoiLXfLhVSK",
      CHAIN_ID: 11155111, // sepolia chain_id
      BASE_CHAIN_ID: 84532,
    },
    production: {
      currentEnv: env,
      apiUrl: "https://qckp089yob.execute-api.us-east-1.amazonaws.com/Prod/",
      aws: {
        s3: {
          REGION: "us-east-1",
          BUCKET_NAME: "pesatoken-kyc-prod",
          IDENTITY_POOL_ID: "us-east-1:539c38cd-87a4-4563-bb9e-16e23aa013f5",
        },
      },
      featureFlags: {
        enableBiometrics: true,
        showDebugInfo: false,
        mockTransactions: false,
      },
      base,
      onchainkitKey: "XoXmoP3ZNKEN8GhfVU2zwrkHpZb7OAOp",
      agentAddress: "0x97143F6376CAA5647389D733D72b836444B0cf50",
      walletAddress: "0x859291D42bC0f9d3988209E3a4920a0E30D58016",
      googleScriptSrc: "https://accounts.google.com/gsi/client",
      googleClientId:
        "339887597881-dtj402e9975k4r8stoejgovj1me8gicn.apps.googleusercontent.com",
      baseSchemaId:
        "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9",
      baseVaultAddress: "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A",
      ETH_RPC_URL:
        "https://eth-mainnet.g.alchemy.com/v2/8Yz1ZLNi87s0MCcIL8s6jzoiLXfLhVSK",
      CHAIN_ID: 1, // mainnet chain_id
      BASE_CHAIN_ID: 8453,
    },
  };

  return configs[env as keyof typeof configs];
};
