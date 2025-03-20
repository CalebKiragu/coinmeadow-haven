import axios, { AxiosError, AxiosResponse } from "axios";
import { store } from "../redux/store";
import { url } from "../utils";
import {
  addNewTransaction,
  fetchTransactionsFailure,
  fetchTransactionsStart,
  fetchTransactionsSuccess,
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

interface TransferPayload {
  type: string;
  initiator: string;
  sender: string;
  recipient: string;
  senderFirstName: string;
  senderLastName: string;
  recipientFirstName: string;
  recipientLastName: string;
  amount: string;
  pin: string;
  inOut: string;
  currency: string;
  txType: "MERCHANTPAY" | "USERSEND" | "DEPOSIT" | "WITHDRAW";
}

interface TransactionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export const TransactionService = {
  // Transfer funds between accounts
  transferFunds: async (
    payload: TransferPayload
  ): Promise<TransactionResponse> => {
    try {
      const response: AxiosResponse<TransactionResponse> = await api.post(
        "v1/transact/transfer",
        payload
      );

      // If successful, add the transaction to the store
      if (response.data.success && response.data.data) {
        store.dispatch(addNewTransaction(response.data.data));
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<TransactionResponse>;
      return {
        success: false,
        error:
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Transaction failed. Please try again.",
      };
    }
  },

  // Make a deposit
  deposit: async (payload: TransferPayload): Promise<TransactionResponse> => {
    try {
      const response: AxiosResponse<TransactionResponse> = await api.post(
        "v1/transact/deposit",
        payload
      );

      if (response.data.success && response.data.data) {
        store.dispatch(addNewTransaction(response.data.data));
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<TransactionResponse>;
      return {
        success: false,
        error:
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Deposit failed. Please try again.",
      };
    }
  },

  // Make a withdrawal
  withdraw: async (payload: TransferPayload): Promise<TransactionResponse> => {
    try {
      const response: AxiosResponse<TransactionResponse> = await api.post(
        "v1/transact/withdraw",
        payload
      );

      if (response.data.success && response.data.data) {
        store.dispatch(addNewTransaction(response.data.data));
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<TransactionResponse>;
      return {
        success: false,
        error:
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Withdrawal failed. Please try again.",
      };
    }
  },

  // Receive funds (generate address or instructions)
  receiveInstructions: async (
    currency: string
  ): Promise<TransactionResponse> => {
    try {
      const response: AxiosResponse<TransactionResponse> = await api.get(
        `v1/transact/receive?currency=${currency}`
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<TransactionResponse>;
      return {
        success: false,
        error:
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Failed to get receiving instructions. Please try again.",
      };
    }
  },

  // Get Transaction History
  getTransactionHistory: async (): Promise<Transaction[]> => {
    store.dispatch(fetchTransactionsStart());
    try {
      const response: AxiosResponse<ApiResponse<Transaction[]>> = await api.get(
        "/transactions/history"
      );
      store.dispatch(fetchTransactionsSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Error fetching transaction history";
      store.dispatch(fetchTransactionsFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },
};
