
import { AuthService } from "./authService";
import { NotificationService } from "./notificationService";
import { VerificationService } from "./verificationService";
import { WalletService } from "./walletService";
import { TransactionService } from "./transactionService";
import { RateService } from "./rateService";

export const ApiService = {
  ...AuthService,
  ...NotificationService,
  ...VerificationService,
  ...WalletService,
  ...TransactionService,
  
  // Add rate service functions
  getForexRates: RateService.fetchForexRates,
  updateForexRates: RateService.updateForexRates,
};
