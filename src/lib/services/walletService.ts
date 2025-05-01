import axios, { AxiosError, AxiosResponse } from "axios";
import {
  fetchWalletStart,
  fetchWalletSuccess,
  fetchWalletFailure,
  Wallet,
} from "../redux/slices/walletSlice";
import {
  fetchPricesStart,
  fetchPricesSuccess,
  fetchPricesFailure,
  PriceData,
} from "../redux/slices/priceSlice";
import { store } from "../redux/store";
import { getEnvironmentConfig } from "../utils";
import { AuthService } from "./authService";
import { VerificationService } from "./verificationService";
import { Transaction } from "../redux/slices/transactionSlice";

// Replace with your actual API base URL for either dev or prod environments
const API_URL = getEnvironmentConfig().apiUrl;

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the auth token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define response types
interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface Charge {
  id?: string;
}

const buildUrl = (
  caller: string,
  urlData?: {
    email?: string;
    phone?: string;
    basePair?: string;
    isMerchant?: string;
    currency?: string;
    limit?: number;
    offset?: number;
    chargeId?: string;
  }
): string => {
  const {
    email,
    phone,
    basePair,
    isMerchant,
    currency,
    limit,
    offset,
    chargeId,
  } = urlData || {};

  switch (caller) {
    case "updatewallets":
      return `v1/balance/${email ? email : phone}?isMerchant=${isMerchant}`;

    case "updateprices":
      return `v1/tokens/rate/all?basePair=${basePair}`;

    case "transactions":
      return `v1/transactions/${email ? email : phone}?limit=${
        limit || 100
      }&offset=${offset || 0}`;

    case "charge":
      return `v1/charge`;

    case "charges":
      return `v1/charges`;

    case "getcharge":
      return `v1/charges/${chargeId}`;

    default:
      return ``;
  }
};

export const WalletService = {
  // Update Dashboard with verification status check
  updateDashboard: async (user?: {
    email?: string;
    phone?: string;
    basePair?: string;
    currency?: string;
    isMerchant?: string;
  }): Promise<{
    wallets: Wallet[];
    prices: PriceData[];
    alerts?: any[];
  }> => {
    const { email, phone, basePair, currency, isMerchant } = user;
    store.dispatch(fetchWalletStart());
    store.dispatch(fetchPricesStart());

    try {
      // Query for verification status
      if (email || phone) {
        await VerificationService.getVerificationStatus({ email, phone });
      }

      const pricesResponse: AxiosResponse<ApiResponse<PriceData[]>> =
        await api.get(buildUrl("updateprices", { basePair }));
      store.dispatch(fetchPricesSuccess(pricesResponse.data.data));
      const walletResponse: AxiosResponse<ApiResponse<Wallet[]>> =
        await api.get(
          buildUrl("updatewallets", {
            email,
            phone,
            basePair,
            currency,
            isMerchant,
          })
        );

      if (!walletResponse.data.data?.length) {
        store.dispatch(fetchWalletFailure("No wallet data found"));
      } else {
        store.dispatch(fetchWalletSuccess(walletResponse.data.data));
      }

      return {
        wallets: walletResponse.data.data || [],
        prices: pricesResponse.data.data || [],
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Error updating wallets and rates";

      store.dispatch(fetchWalletFailure(errorMessage));
      store.dispatch(fetchPricesFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },

  // Legacy method aliases
  getBalance: async (user?: {
    email?: string;
    phone?: string;
    basePair?: string;
    currency?: string;
    isMerchant?: string;
  }): Promise<Wallet[]> => {
    const result = await WalletService.updateDashboard(user);
    return result.wallets;
  },

  // Create new commerce charge method
  createCharge: async (chargeData?: {
    amount?: string;
    currency?: string;
    orderId?: string;
    type?: string;
  }): Promise<Charge> => {
    try {
      if (!chargeData?.amount || !chargeData?.currency) {
        throw new Error("amount and currency is required");
      }

      const response: AxiosResponse<ApiResponse<Charge>> = await api.post(
        buildUrl("charge"),
        chargeData
      );
      if (!response.data.data) {
        throw new Error(
          response.data.message ||
            response.data.error ||
            "Failed to create charge"
        );
      }
      return response.data.data || { id: null };
    } catch (error) {
      console.error("Error fetching creating charge:", error);
      return { id: null };
    }
  },

  // Query a charge by chargeId method
  queryCharge: async (chargeData?: { chargeId?: string }): Promise<Charge> => {
    try {
      if (!chargeData?.chargeId) {
        throw new Error("chargeId is required");
      }

      const response: AxiosResponse<ApiResponse<Charge>> = await api.get(
        buildUrl("getcharge", chargeData)
      );
      if (!response.data.data) {
        throw new Error(
          response.data.message || response.data.error || "Failed to get charge"
        );
      }
      return response.data.data || { id: null };
    } catch (error) {
      console.error("Error fetching charge:", error);
      return { id: null };
    }
  },

  // Get all charges for api key
  getCharges: async (): Promise<Charge[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Charge[]>> = await api.get(
        buildUrl("charges")
      );
      if (!response.data.data) {
        throw new Error(
          response.data.message ||
            response.data.error ||
            "Failed to get charges"
        );
      }
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching getting charges:", error);
      return [];
    }
  },

  // Improved and fully implemented fetchTransactions method
  fetchTransactions: async (user?: {
    email?: string;
    phone?: string;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> => {
    try {
      if (!user?.email && !user?.phone) {
        throw new Error("Email or phone is required");
      }

      const response: AxiosResponse<ApiResponse<Transaction[]>> = await api.get(
        buildUrl("transactions", user)
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch transactions"
        );
      }

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  },
};
