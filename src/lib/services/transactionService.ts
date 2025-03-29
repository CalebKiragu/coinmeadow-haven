
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
      // In a real implementation, this would call the API endpoint
      // For now, we'll generate mock data to simulate the API response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockTransactions: Transaction[] = generateMockTransactions(20);
      
      store.dispatch(fetchTransactionsSuccess(mockTransactions));
      return mockTransactions;
    } catch (error) {
      const errorMessage = "Error fetching transaction history";
      store.dispatch(fetchTransactionsFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },
};

// Helper function to generate mock transactions
function generateMockTransactions(count: number): Transaction[] {
  const transactionTypes: ("SEND" | "RECEIVE" | "DEPOSIT" | "WITHDRAW")[] = [
    "SEND", "RECEIVE", "DEPOSIT", "WITHDRAW"
  ];
  
  const statuses: ("INPROGRESS" | "CONFIRMED" | "CANCELLED")[] = [
    "INPROGRESS", "CONFIRMED", "CANCELLED"
  ];
  
  const currencies = ["BTC", "ETH", "USDT"];
  
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const amount = (Math.random() * (type === "SEND" || type === "WITHDRAW" ? 0.5 : 2)).toFixed(6);
    const timestamp = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000); // Up to 30 days ago
    
    transactions.push({
      type,
      userId: "user123",
      sender: type === "RECEIVE" || type === "DEPOSIT" ? 
        "external-sender" : "user-wallet",
      recipient: [{
        address: type === "SEND" || type === "WITHDRAW" ? 
          `recipient-${Math.floor(Math.random() * 1000)}` : "user-wallet",
        amount,
        currency,
        basePair: currency
      }],
      txId: `tx-${i}-${Date.now()}`,
      inOut: `${currency}-${currency}`,
      grossValue: amount,
      grossCurrency: currency,
      netValue: (parseFloat(amount) * 0.98).toFixed(6), // Simulating fees
      netCurrency: currency,
      fee: [{
        fiat: parseFloat(amount) * 0.02 * 65000, // Simulated USD value
        crypto: parseFloat(amount) * 0.02 // 2% fee
      }],
      status,
      timestamp: BigInt(timestamp),
      updatedAt: BigInt(timestamp + 300000), // 5 minutes later
      ids: {
        ref: `ref-${i}`,
        blockchain: `bc-${i}`
      }
    });
  }
  
  // Sort by timestamp descending (newest first)
  return transactions.sort((a, b) => 
    Number(b.timestamp) - Number(a.timestamp)
  );
}
