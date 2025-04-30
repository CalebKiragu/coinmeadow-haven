
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
import { url, getEnvironmentConfig } from "../utils";
import { AuthService } from "./authService";
import { VerificationService } from "./verificationService";

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

const buildUrl = (
  caller: string,
  urlData?: {
    email?: string;
    phone?: string;
    basePair?: string;
    isMerchant?: string;
    currency?: string;
  }
): string => {
  const { email, phone, basePair, isMerchant, currency } = urlData;

  switch (caller) {
    case "updatewallets":
      return `v1/balance/${email ? email : phone}?isMerchant=${isMerchant}`;

    case "updateprices":
      return `v1/tokens/rate/all?basePair=${basePair}`;

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
  
  fetchTransactions: async (user?: {
    email?: string;
    phone?: string;
  }): Promise<any[]> => {
    // This is a temporary implementation that returns an empty array
    // It should be replaced with an actual implementation in the future
    return [];
  }
};
