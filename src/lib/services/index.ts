
import { AuthService } from "./authService";
import { TransactionService } from "./transactionService";
import { VerificationService } from "./verificationService";
import { WalletService } from "./walletService";
import {
  LoginResponse,
  LoginPayload,
  MerchantRegistrationPayload,
  MerchantResponse,
  OtpVerificationResponse,
  UserRegistrationPayload,
  UserResponse,
} from "../types";

export const ApiService = {
  // Auth services
  loginUser: AuthService.loginUser,
  loginMerchant: AuthService.loginMerchant,
  registerUser: AuthService.registerUser,
  registerMerchant: AuthService.registerMerchant,
  verifyUserEmail: AuthService.verifyUserEmail,
  verifyMerchantEmail: AuthService.verifyMerchantEmail,
  changeUserPin: AuthService.changeUserPin,
  changeMerchantPin: AuthService.changeMerchantPin,
  resetUserPin: AuthService.resetUserPin,
  resetMerchantPin: AuthService.resetMerchantPin,
  resendUserEmailOTP: AuthService.resendUserEmailOTP,
  resendUserPhoneOTP: AuthService.resendUserPhoneOTP,
  resendMerchantEmailOTP: AuthService.resendMerchantEmailOTP,
  resendMerchantPhoneOTP: AuthService.resendMerchantPhoneOTP,

  // Verification services
  uploadKYC: VerificationService.uploadKYC,
  getVerificationStatus: VerificationService.getVerificationStatus,
  
  // Wallet services
  getBalance: WalletService.getBalance,
  fetchTransactions: WalletService.fetchTransactions,
  
  // Transaction services
  transferFunds: TransactionService.transferFunds,
  deposit: TransactionService.deposit,
  withdraw: TransactionService.withdraw,
  receiveInstructions: TransactionService.receiveInstructions,
  getTransactionHistory: TransactionService.getTransactionHistory,
};
