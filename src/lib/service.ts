import axios, { AxiosError, AxiosResponse } from "axios";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  User,
  Merchant,
  Token,
  updateOtp,
} from "./redux/slices/authSlice";
import {
  fetchWalletStart,
  fetchWalletSuccess,
  fetchWalletFailure,
  Wallet,
} from "./redux/slices/walletSlice";
import {
  fetchPricesStart,
  fetchPricesSuccess,
  fetchPricesFailure,
  PriceData,
} from "./redux/slices/priceSlice";
import {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  Transaction,
} from "./redux/slices/transactionSlice";
import { store } from "./redux/store";
import { url } from "./utils";

// Replace with your actual API base URL
const API_URL = url().BASE_URL;

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const buildUrl = (
  caller: string,
  urlData?: {
    email?: string;
    phone?: string;
    otp?: string;
    otpId?: string;
    basePair?: string;
    isMerchant?: string;
    currency?: string;
  }
): string => {
  const { email, phone, otp, otpId, basePair, isMerchant, currency } = urlData;

  switch (caller) {
    case "verifyuserphone":
      return `v1/users/verify/phone?${phone && `phone=${phone}`}${
        otp ? `&otp=${otp}` : ``
      }${otpId ? `&otpId=${otpId}` : ``}`;

    case "verifymerchantphone":
      return `v1/merchants/verify/phone?${phone && `phone=${phone}`}${
        otp ? `&otp=${otp}` : ``
      }${otpId ? `&otpId=${otpId}` : ``}`;

    case "verifyuseremail":
      return `v1/users/verify/email?${email && `email=${email}`}${
        otp ? `&otp=${otp}` : ``
      }${otpId ? `&otpId=${otpId}` : ``}`;

    case "verifymerchantemail":
      return `v1/merchants/verify/email?${email && `email=${email}`}${
        otp ? `&otp=${otp}` : ``
      }${otpId ? `&otpId=${otpId}` : ``}`;

    case "updatewallets":
      return `v1/balance/${email ? email : phone}?isMerchant=${isMerchant}`;

    case "updateprices":
      return `v1/tokens/rate/all?basePair=${basePair}`;

    default:
      return ``;
  }
};

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
  otpId: any;
  success?: boolean;
  data?: T;
  msg?: string;
  message?: string;
  status?: string | boolean;
  error?: string;
}

interface AuthResponse {
  user?: User;
  merchant?: Merchant;
  token: Token;
}

interface VerificationResponse {
  success?: boolean;
  message?: string;
}

interface OtpVerificationResponse {
  otpId?: string;
  success?: boolean;
  msg?: string;
}

// API service functions
export const ApiService = {
  // Verify Email
  verifyUserEmail: async (
    email: string,
    otp?: string,
    otpId?: string
  ): Promise<OtpVerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<OtpVerificationResponse>> =
        await api.get(buildUrl("verifyuseremail", { email, otp, otpId }));
      if (response.data.otpId) store.dispatch(updateOtp(response.data));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(
        axiosError.response?.data?.message || "Error verifying user email"
      );
    }
  },

  verifyMerchantEmail: async (
    email: string,
    otp?: string,
    otpId?: string
  ): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> =
        await api.get(buildUrl("verifymerchantemail", { email, otp, otpId }));
      if (response.data.otpId) store.dispatch(updateOtp(response.data));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(
        axiosError.response?.data?.message || "Error verifying merchant email"
      );
    }
  },

  // Verify Phone
  verifyUserPhone: async (
    phone: string,
    otp?: string,
    otpId?: string
  ): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> =
        await api.get(buildUrl("verifyuserphone", { phone, otp, otpId }));
      if (response.data.otpId) store.dispatch(updateOtp(response.data));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(
        axiosError.response?.data?.message || "Error verifying user phone"
      );
    }
  },

  verifyMerchantPhone: async (
    phone: string,
    otp?: string,
    otpId?: string
  ): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> =
        await api.get(buildUrl("verifymerchantphone", { phone, otp, otpId }));
      if (response.data.otpId) store.dispatch(updateOtp(response.data));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(
        axiosError.response?.data?.message || "Error verifying merchant phone"
      );
    }
  },

  // Signup User
  signupUser: async (userData: {
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    pin: string;
    otpId: string;
    refId?: string;
  }): Promise<AuthResponse> => {
    store.dispatch(loginStart());
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post(
        "v1/users/register",
        userData
      );
      store.dispatch(loginSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage =
        axiosError.response?.data?.message || "Error signing up user";
      store.dispatch(loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },

  // Signup Merchant
  signupMerchant: async (merchantData: {
    email?: string;
    phone?: string;
    otpId: string;
    pin: string;
    merchantName: string;
    repName: string;
    repContact: string;
    refId?: string;
  }): Promise<AuthResponse> => {
    store.dispatch(loginStart());
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post(
        "v1/merchants/register",
        merchantData
      );
      store.dispatch(loginSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage =
        axiosError.response?.data?.message || "Error signing up merchant";
      store.dispatch(loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },

  // Login User
  loginUser: async (credentials: {
    email?: string;
    phone?: string;
    otp?: string;
    otpId?: string;
    pin: string;
  }): Promise<AuthResponse> => {
    store.dispatch(loginStart());
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post(
        "v1/users/login",
        credentials
      );
      store.dispatch(loginSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Error logging in user";
      store.dispatch(loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  },

  // Login Merchant
  loginMerchant: async (credentials: {
    email?: string;
    phone?: string;
    otp?: string;
    otpId?: string;
    pin: string;
  }): Promise<AuthResponse> => {
    store.dispatch(loginStart());
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post(
        "v1/merchants/login",
        credentials
      );
      store.dispatch(loginSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Error logging in merchant";
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
      const response: AxiosResponse<ApiResponse<VerificationResponse>> =
        await api.post("/auth/verify-otp", data);
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(
        axiosError.response?.data?.message || "Error verifying OTP"
      );
    }
  },

  // Change wallet PIN
  changeUserPin: async (data?: {
    phone?: string;
    email?: string;
    oldPin: string;
    newPin: string;
  }): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> =
        await api.post("v1/users/changepin", data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Error changing user PIN"
      );
    }
  },

  changeMerchantPin: async (data?: {
    phone?: string;
    email?: string;
    oldPin: string;
    newPin: string;
  }): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> =
        await api.post("v1/merchants/changepin", data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Error changing merchant PIN"
      );
    }
  },

  // Reset wallet PIN
  resetUserPin: async (data?: {
    phone?: string;
    email?: string;
    otpId?: string;
    otp?: string;
    newPin?: string;
  }): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> =
        await api.post("v1/users/resetpin", data);
      if (response.data.otpId) store.dispatch(updateOtp(response.data));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Error reseting user PIN"
      );
    }
  },

  resetMerchantPin: async (data?: {
    phone?: string;
    email?: string;
    otpId?: string;
    otp?: string;
    newPin?: string;
  }): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> =
        await api.post("v1/merchants/resetpin", data);
      if (response.data.otpId) store.dispatch(updateOtp(response.data));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Error reseting merchant PIN"
      );
    }
  },

  // Update Dashboard
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

      if (!walletResponse.data.data.length)
        store.dispatch(fetchWalletFailure(walletResponse.data.data.toString()));
      if (walletResponse.data.data.length > 0)
        store.dispatch(fetchWalletSuccess(walletResponse.data.data));

      return {
        wallets: walletResponse.data.data,
        prices: pricesResponse.data.data,
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

// Function to update prices every minute
// export const startPriceUpdates = () => {
//   // Call once immediately
//   ApiService.updateDashboard().catch((error) =>
//     console.error("Price update error:", error)
//   );

//   // Then set interval for every minute
//   const intervalId = setInterval(() => {
//     ApiService.updateDashboard().catch((error) =>
//       console.error("Price update error:", error)
//     );
//   }, 60000); // 60000 ms = 1 minute

//   return intervalId; // Return the interval ID so it can be cleared if needed
// };
