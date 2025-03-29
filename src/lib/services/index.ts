
import { AuthService } from "./authService";
import { TransactionService } from "./transactionService";
import { VerificationService } from "./verificationService";
import { WalletService } from "./walletService";
import { NotificationService } from "./notificationService";

export const ApiService = {
  // Auth services
  loginUser: AuthService.loginUser,
  loginMerchant: AuthService.loginMerchant,
  registerUser: AuthService.registerUser,
  registerMerchant: AuthService.registerMerchant,
  signupUser: AuthService.signupUser,
  signupMerchant: AuthService.signupMerchant,
  verifyUserEmail: AuthService.verifyUserEmail,
  verifyMerchantEmail: AuthService.verifyMerchantEmail,
  verifyUserPhone: AuthService.verifyUserPhone,
  verifyMerchantPhone: AuthService.verifyMerchantPhone,
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
  submitKycVerification: VerificationService.submitKycVerification,
  getVerificationStatus: VerificationService.getVerificationStatus,
  
  // Wallet services
  getBalance: WalletService.getBalance,
  fetchTransactions: WalletService.fetchTransactions,
  updateDashboard: WalletService.updateDashboard,
  
  // Transaction services
  transferFunds: TransactionService.transferFunds,
  deposit: TransactionService.deposit,
  withdraw: TransactionService.withdraw,
  receiveInstructions: TransactionService.receiveInstructions,
  getTransactionHistory: TransactionService.getTransactionHistory,
  
  // Notification services
  sendPushNotification: NotificationService.sendPushNotification,
  requestNotificationPermission: NotificationService.requestPermission,
  notifyNewTransaction: NotificationService.notifyNewTransaction,
  notifyTransactionStatus: NotificationService.notifyTransactionStatus,
  notifyKycStatus: NotificationService.notifyKycStatus,
};
