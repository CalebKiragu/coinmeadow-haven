
export * from './authService';
export * from './walletService';
export * from './verificationService';
export * from './apiService';

import { AuthService } from "./authService";
import { NotificationService } from "./notificationService";
import { VerificationService } from "./verificationService";
import { WalletService } from "./walletService";
import { TransactionService } from "./transactionService";
import { RateService } from "./rateService";
import { ApiService } from "./apiService";

// Legacy export for backward compatibility
export default {
  ...AuthService,
  ...NotificationService,
  ...VerificationService,
  ...WalletService,
  ...TransactionService,
  ...ApiService,
  
  // Add rate service functions
  getForexRates: RateService.fetchForexRates,
  updateForexRates: RateService.updateForexRates,
  
  // Ensure the notification permission method is properly exposed
  requestPermission: NotificationService.requestPermission,
};
