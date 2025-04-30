
// Export individual service modules
export * from './authService';
export * from './walletService';
export * from './verificationService';
export * from './apiService';
export * from './notificationService';
export * from './transactionService';
export * from './rateService';

// Import services
import { AuthService } from "./authService";
import { NotificationService } from "./notificationService";
import { VerificationService } from "./verificationService";
import { WalletService } from "./walletService";
import { TransactionService } from "./transactionService";
import { RateService } from "./rateService";
import { ApiService } from "./apiService";

// Create a merged service object for backward compatibility
const services = {
  // Include all methods from each service
  ...AuthService,
  ...NotificationService,
  ...VerificationService,
  ...WalletService,
  ...TransactionService,
  ...RateService,
  ...ApiService,

  // Ensure specific methods are properly exposed
  // Authentication methods
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
  
  // Wallet methods
  updateDashboard: WalletService.updateDashboard,
  getBalance: WalletService.getBalance,
  
  // Verification methods
  getVerificationStatus: VerificationService.getVerificationStatus,
  submitKycVerification: VerificationService.submitKycVerification,
  uploadKYC: VerificationService.uploadKYC,
  
  // Notification methods
  requestPermission: NotificationService.requestPermission,
  
  // Transaction methods
  getTransactionHistory: TransactionService.getTransactionHistory,
  deposit: TransactionService.deposit,
  withdraw: TransactionService.withdraw,
  transferFunds: TransactionService.transferFunds,
  getDepositAddresses: TransactionService.getDepositAddresses,
  generateDepositAddress: TransactionService.generateDepositAddress
};

export default services;
