
import axios from "axios";
import { getEnvironmentConfig } from "../utils";
import { AuthService } from "./authService";
import { WalletService } from "./walletService";
import { VerificationService } from "./verificationService";
import { NotificationService } from "./notificationService";
import { TransactionService } from "./transactionService";

const API_URL = getEnvironmentConfig().apiUrl;

export interface ProfileUpdatePayload {
  [key: string]: string;
}

export const ApiService = {
  // Base profile update method
  updateProfile: async (endpoint: string, payload: ProfileUpdatePayload) => {
    try {
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update profile");
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  // Auth Service methods
  loginUser: AuthService.loginUser,
  loginMerchant: AuthService.loginMerchant,
  signupUser: AuthService.signupUser,
  signupMerchant: AuthService.signupMerchant,
  verifyUserEmail: AuthService.verifyUserEmail,
  verifyUserPhone: AuthService.verifyUserPhone,
  verifyMerchantEmail: AuthService.verifyMerchantEmail,
  verifyMerchantPhone: AuthService.verifyMerchantPhone,
  resetUserPin: AuthService.resetUserPin,
  resetMerchantPin: AuthService.resetMerchantPin,
  changeUserPin: AuthService.changeUserPin,
  changeMerchantPin: AuthService.changeMerchantPin,

  // Wallet Service methods
  updateDashboard: WalletService.updateDashboard,
  getBalance: WalletService.getBalance,
  
  // Verification Service methods
  getVerificationStatus: VerificationService.getVerificationStatus,
  submitKycVerification: VerificationService.submitKycVerification,
  uploadKYC: VerificationService.uploadKYC,
  
  // Notification Service methods
  requestPermission: NotificationService.requestPermission,
  
  // Transaction Service methods
  getTransactionHistory: TransactionService.getTransactionHistory,
  deposit: TransactionService.deposit,
  withdraw: TransactionService.withdraw,
  transferFunds: TransactionService.transferFunds,
  getDepositAddresses: TransactionService.getDepositAddresses,
  generateDepositAddress: TransactionService.generateDepositAddress
};

export default ApiService;
