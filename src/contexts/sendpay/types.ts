
// Types for the SendPay context
export type CurrencyRates = {
  [key: string]: number;
};

// Mobile transfer types
export interface MobileTransferState {
  mobileNumber: string;
  mobileAmount: string;
  mobilePin: string;
  mobileInputType: "phone" | "email";
  selectedCountryCode: string;
}

// Merchant payment types
export interface MerchantPaymentState {
  merchantNumber: string;
  merchantAmount: string;
  merchantPin: string;
}

// Blockchain transfer types
export interface BlockchainTransferState {
  blockchainMode: boolean;
  blockchainAddress: string;
  blockchainAmount: string;
  blockchainPin: string;
}

// Currency settings types
export interface CurrencyState {
  selectedCryptoCurrency: string;
  selectedFiatCurrency: string;
  isCryptoAmount: boolean;
  rates: CurrencyRates;
  isLoading: boolean;
}
