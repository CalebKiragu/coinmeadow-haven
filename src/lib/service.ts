
import axios, { AxiosError, AxiosResponse } from 'axios';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  User 
} from './redux/slices/authSlice';
import { 
  fetchBalanceStart, 
  fetchBalanceSuccess, 
  fetchBalanceFailure, 
  WalletBalance 
} from './redux/slices/walletSlice';
import {
  fetchPricesStart,
  fetchPricesSuccess,
  fetchPricesFailure,
  PriceData,
} from './redux/slices/priceSlice';
import {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  Transaction,
} from './redux/slices/transactionSlice';
import { store } from './redux/store';

// Replace with your actual API base URL
const API_URL = 'https://api.coinduka.com/v1';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the auth token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
}

// API service functions
export const ApiService = {
  // Verify Email
  verifyEmail: async (email: string): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> = await api.post('/auth/verify-email', { email });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(axiosError.response?.data?.message || 'Error verifying email');
    }
  },

  // Verify Phone
  verifyPhone: async (phone: string): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> = await api.post('/auth/verify-phone', { phone });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(axiosError.response?.data?.message || 'Error verifying phone');
    }
  },

  // Signup User
  signupUser: async (userData: {
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    pin: string;
    country: string;
    refId?: string;
  }): Promise<AuthResponse> => {
    store.dispatch(loginStart());
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/signup', userData);
      store.dispatch(loginSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = axiosError.response?.data?.message || 'Error signing up';
      store.dispatch(loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },

  // Signup Merchant
  signupMerchant: async (merchantData: {
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    pin: string;
    country: string;
    merchantName: string;
    repName: string;
    repContact: string;
    refId?: string;
  }): Promise<AuthResponse> => {
    store.dispatch(loginStart());
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/merchant/signup', merchantData);
      store.dispatch(loginSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = axiosError.response?.data?.message || 'Error signing up merchant';
      store.dispatch(loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },

  // Login User
  loginUser: async (credentials: {
    email?: string;
    phone?: string;
    pin: string;
  }): Promise<AuthResponse> => {
    store.dispatch(loginStart());
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/login', credentials);
      store.dispatch(loginSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = axiosError.response?.data?.message || 'Error logging in';
      store.dispatch(loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },

  // Login Merchant
  loginMerchant: async (credentials: {
    email?: string;
    phone?: string;
    pin: string;
  }): Promise<AuthResponse> => {
    store.dispatch(loginStart());
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/merchant/login', credentials);
      store.dispatch(loginSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = axiosError.response?.data?.message || 'Error logging in merchant';
      store.dispatch(loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },

  // Verify OTP (for both user and merchant)
  verifyOtp: async (data: {
    email?: string;
    phone?: string;
    otp: string;
  }): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> = await api.post('/auth/verify-otp', data);
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(axiosError.response?.data?.message || 'Error verifying OTP');
    }
  },

  // Update Dashboard
  updateDashboard: async (): Promise<{
    balances: WalletBalance[];
    prices: PriceData[];
    alerts: any[];
  }> => {
    store.dispatch(fetchBalanceStart());
    store.dispatch(fetchPricesStart());
    
    try {
      const response: AxiosResponse<ApiResponse<{
        balances: WalletBalance[];
        prices: PriceData[];
        alerts: any[];
      }>> = await api.get('/dashboard/update');
      
      store.dispatch(fetchBalanceSuccess(response.data.data.balances));
      store.dispatch(fetchPricesSuccess(response.data.data.prices));
      
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = axiosError.response?.data?.message || 'Error updating dashboard';
      store.dispatch(fetchBalanceFailure(errorMessage));
      store.dispatch(fetchPricesFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },

  // Get Transaction History
  getTransactionHistory: async (): Promise<Transaction[]> => {
    store.dispatch(fetchTransactionsStart());
    try {
      const response: AxiosResponse<ApiResponse<Transaction[]>> = await api.get('/transactions/history');
      store.dispatch(fetchTransactionsSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage = axiosError.response?.data?.message || 'Error fetching transaction history';
      store.dispatch(fetchTransactionsFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },
};

// Function to update prices every minute
export const startPriceUpdates = () => {
  // Call once immediately
  ApiService.updateDashboard().catch(error => console.error('Price update error:', error));
  
  // Then set interval for every minute
  const intervalId = setInterval(() => {
    ApiService.updateDashboard().catch(error => console.error('Price update error:', error));
  }, 60000); // 60000 ms = 1 minute
  
  return intervalId; // Return the interval ID so it can be cleared if needed
};
