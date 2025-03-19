
import { AuthService } from './authService';
import { TransactionService } from './transactionService';
import { VerificationService } from './verificationService';
import { WalletService } from './walletService';
import { Transaction } from '../redux/slices/transactionSlice';
import { PriceData } from '../redux/slices/priceSlice';
import { Wallet } from '../redux/slices/walletSlice';
import { VerificationStatus } from '../redux/slices/authSlice';
import axios, { AxiosError, AxiosResponse } from "axios";
import { store } from "../redux/store";
import { url } from "../utils";
import { 
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
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

// Export a unified API service
export const ApiService = {
  // Auth operations
  verifyUserEmail: AuthService.verifyUserEmail,
  verifyMerchantEmail: AuthService.verifyMerchantEmail,
  verifyUserPhone: AuthService.verifyUserPhone,
  verifyMerchantPhone: AuthService.verifyMerchantPhone,
  signupUser: AuthService.signupUser,
  signupMerchant: AuthService.signupMerchant,
  loginUser: AuthService.loginUser,
  loginMerchant: AuthService.loginMerchant,
  verifyOtp: AuthService.verifyOtp,
  changeUserPin: AuthService.changeUserPin,
  changeMerchantPin: AuthService.changeMerchantPin,
  resetUserPin: AuthService.resetUserPin,
  resetMerchantPin: AuthService.resetMerchantPin,
  getVerificationStatus: AuthService.getVerificationStatus,
  
  // Verification operations
  submitKycVerification: VerificationService.submitKycVerification,
  
  // Wallet operations
  updateDashboard: WalletService.updateDashboard,
  
  // Transaction operations
  transferFunds: TransactionService.transferFunds,
  deposit: TransactionService.deposit,
  withdraw: TransactionService.withdraw,
  receiveInstructions: TransactionService.receiveInstructions,
  
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
