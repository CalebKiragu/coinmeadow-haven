import axios, { AxiosError, AxiosResponse } from "axios";
import { store } from "../redux/store";
import { url } from "../utils";
import {
  VerificationStatus,
  setVerificationStatus,
} from "../redux/slices/authSlice";

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

interface VerificationResponse {
  success?: boolean;
  message?: string;
}

interface KycVerificationData {
  firstName: string;
  lastName: string;
  govId: string;
  email?: string;
  phone?: string;
  selfie: string;
  idFront: string;
  idBack: string;
  location: string[];
  isMerchant: boolean;
}

const buildUrl = (
  caller: string,
  urlData?: {
    email?: string;
    phone?: string;
    status?: string;
  }
): string => {
  const { email, phone, status } = urlData;

  switch (caller) {
    case "verificationstatus":
      return `v1/verification/status?${email ? `email=${email}` : ""}${
        phone ? `phone=${phone}` : ""
      }${status ? `&status=${status}` : ""}`;

    default:
      return ``;
  }
};

export const VerificationService = {
  // Get verification status
  getVerificationStatus: async (data: {
    email?: string;
    phone?: string;
    status?: string;
  }): Promise<VerificationStatus[]> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationStatus[]>> =
        await api.get(buildUrl("verificationstatus", data));

      if (response.data.data) {
        store.dispatch(setVerificationStatus(response.data.data));
      }

      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      console.error("Error fetching verification status:", axiosError);
      return [];
    }
  },

  // Submit KYC Verification
  submitKycVerification: async (
    data: KycVerificationData
  ): Promise<VerificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<VerificationResponse>> =
        await api.post("v1/verification/submit", data);

      // After successful submission, fetch the updated verification status
      if (response.data.success) {
        await VerificationService.getVerificationStatus({
          email: data.email,
          phone: data.phone,
        });
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      throw new Error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Error submitting verification"
      );
    }
  },
};
