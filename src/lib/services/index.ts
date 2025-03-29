
import { AuthService } from "./authService";
import { TransactionService } from "./transactionService";
import { VerificationService } from "./verificationService";
import { WalletService } from "./walletService";

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
  
  // Resend OTP operations
  resendUserEmailOTP: AuthService.resendUserEmailOTP,
  resendUserPhoneOTP: AuthService.resendUserPhoneOTP,
  resendMerchantEmailOTP: AuthService.resendMerchantEmailOTP,
  resendMerchantPhoneOTP: AuthService.resendMerchantPhoneOTP,

  // Verification operations
  getVerificationStatus: VerificationService.getVerificationStatus,
  submitKycVerification: VerificationService.submitKycVerification,

  // Wallet operations
  updateDashboard: WalletService.updateDashboard,

  // Transaction operations
  getTransactionHistory: TransactionService.getTransactionHistory,
  transferFunds: TransactionService.transferFunds,
  deposit: TransactionService.deposit,
  withdraw: TransactionService.withdraw,
  receiveInstructions: TransactionService.receiveInstructions,
};
