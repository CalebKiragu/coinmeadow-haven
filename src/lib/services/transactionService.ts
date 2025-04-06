
import axios, { AxiosError, AxiosResponse } from "axios";
import { store } from "../redux/store";
import { url } from "../utils";
import {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  Transaction,
} from "../redux/slices/transactionSlice";

// Replace with your actual API base URL
const API_URL = url().BASE_URL;

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

interface TransferResponse {
  success?: boolean;
  message?: string;
  error?: string;
  msg?: string;
}

interface DepositAddressResponse {
  address?: string;
  addresses?: string[];
  error?: string;
}

export const TransactionService = {
  // Transfer funds between users
  transferFunds: async (data: any): Promise<TransferResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<TransferResponse>> =
        await api.post("v1/transfer", data);
      return response.data.data || { success: false };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = 
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Error transferring funds";
      return { success: false, error: errorMessage };
    }
  },

  // Make a deposit
  deposit: async (data: any): Promise<TransferResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<TransferResponse>> =
        await api.post("v1/deposit", data);
      return response.data.data || { success: false };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = 
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Error processing deposit";
      return { success: false, error: errorMessage };
    }
  },

  // Make a withdrawal
  withdraw: async (data: any): Promise<TransferResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<TransferResponse>> =
        await api.post("v1/withdraw", data);
      return response.data.data || { success: false };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = 
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Error processing withdrawal";
      return { success: false, error: errorMessage };
    }
  },

  // Get previously generated addresses
  getDepositAddresses: async (params: {
    userIdentifier: string; 
    currency: string;
    isMerchant: boolean;
  }): Promise<string[]> => {
    try {
      const { userIdentifier, currency, isMerchant } = params;
      console.log(`Fetching addresses for ${userIdentifier}, currency: ${currency}, isMerchant: ${isMerchant}`);
      
      const response: AxiosResponse<ApiResponse<DepositAddressResponse>> =
        await api.get(
          `v1/wallets/address/get/${userIdentifier}?fresh=false&currency=${currency.toLowerCase()}&isMerchant=${isMerchant}&raw=false`
        );
      
      console.log("Address response:", response.data);
      
      if (response.data.data?.error) {
        throw new Error(response.data.data.error);
      }
      
      // Handle case where addresses might be undefined
      const addresses = response.data.data?.addresses || [];
      console.log("Returning addresses:", addresses);
      return addresses;
    } catch (error) {
      console.error("Error fetching deposit addresses:", error);
      // Return empty array instead of undefined
      return [];
    }
  },

  // Generate new deposit address
  generateDepositAddress: async (params: {
    userIdentifier: string;
    currency: string;
    isMerchant: boolean;
    fresh: boolean;
  }): Promise<string> => {
    try {
      const { userIdentifier, currency, isMerchant, fresh } = params;
      console.log(`Generating address for ${userIdentifier}, currency: ${currency}, isMerchant: ${isMerchant}, fresh: ${fresh}`);
      
      const response: AxiosResponse<ApiResponse<DepositAddressResponse>> =
        await api.get(
          `v1/wallets/address/generate/${userIdentifier}?currency=${currency.toLowerCase()}&isMerchant=${isMerchant}&fresh=${fresh}&raw=false`
        );

      console.log("Generate address response:", response.data);
      
      if (response.data.data?.error) {
        throw new Error(response.data.data.error);
      }

      // If address is undefined, throw an error
      if (!response.data.data?.address) {
        throw new Error("No address returned from API");
      }

      return response.data.data.address;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error generating address:", error.message);
        throw new Error(error.message || "Error generating deposit address");
      }
      console.error("Unknown error generating address");
      throw new Error("Error generating deposit address");
    }
  },

  // Legacy method alias for receiveInstructions
  receiveInstructions: async (currency: string): Promise<any> => {
    console.warn("receiveInstructions is deprecated, use generateDepositAddress instead");
    // For backward compatibility, we'll keep this function but call the new one
    try {
      const userInfo = store.getState().auth.user || store.getState().auth.merchant;
      const isMerchant = !!store.getState().auth.merchant;
      const identifier = userInfo?.email || userInfo?.phone || "";
      
      if (!identifier) {
        throw new Error("User not logged in");
      }

      const address = await TransactionService.generateDepositAddress({
        userIdentifier: identifier,
        currency,
        isMerchant,
        fresh: false,
      });

      return { success: true, data: { address } };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Unknown error occurred" };
    }
  },

  // Get transaction history using new endpoint
  getTransactionHistory: async (): Promise<Transaction[]> => {
    store.dispatch(fetchTransactionsStart());
    try {
      const userInfo = store.getState().auth.user || store.getState().auth.merchant;
      const identifier = userInfo?.email || userInfo?.phone;
      
      if (!identifier) {
        throw new Error("User not logged in");
      }
      
      console.log("Fetching transaction history for", identifier);
      
      // Updated endpoint with more detailed logging
      const response: AxiosResponse<ApiResponse<Transaction[]>> = await api.get(
        `v1/transactions/find?initiator=${identifier}&sender=${identifier}&recipient=${identifier}`
      );
      
      console.log("Transaction history response status:", response.status);
      console.log("Transaction history response data:", response.data);
      
      if (!response.data.data) {
        console.log("No transaction data returned, using empty array");
        store.dispatch(fetchTransactionsSuccess([]));
        return [];
      }
      
      // Ensure we convert timestamp and updatedAt to BigInt for consistency
      const processedTransactions = response.data.data.map(tx => ({
        ...tx,
        timestamp: typeof tx.timestamp === 'number' ? BigInt(tx.timestamp) : tx.timestamp,
        updatedAt: typeof tx.updatedAt === 'number' ? BigInt(tx.updatedAt) : tx.updatedAt
      }));
      
      console.log(`Found ${processedTransactions.length} transactions`);
      store.dispatch(fetchTransactionsSuccess(processedTransactions));
      return processedTransactions;
    } catch (error) {
      let errorMessage = "Failed to fetch transaction history";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Transaction history error:", errorMessage);
      store.dispatch(fetchTransactionsFailure(errorMessage));
      return [];
    }
  },
};
