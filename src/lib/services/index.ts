
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

// Legacy export for backward compatibility
export default {
  ...AuthService,
  ...NotificationService,
  ...VerificationService,
  ...WalletService,
  ...TransactionService,
  ...RateService,
  ...ApiService,
  
  // Ensure the notification permission method is properly exposed
  requestPermission: NotificationService.requestPermission,
};
