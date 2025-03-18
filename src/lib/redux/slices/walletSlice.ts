import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Balance {
  accountBalance: string;
  availableBalance: string;
}

export interface Address {
  address: string;
  index: number;
}

export interface Wallet {
  active: boolean;
  frozen: boolean;
  balance: Balance;
  currency: string;
  accountingCurrency: string;
  walletId?: string;
  userId?: string;
  email?: string;
  phone?: string;
  isMerchant?: boolean;
  merchantNo?: string;
  createdAt?: bigint;
  addresses?: Address[];
  accountCode?: string;
  accountNumber?: string;
  customerId: string;
  id: string;
  error?: string;
}

interface WalletState {
  wallets: Wallet[];
  selectedCrypto: string;
  selectedFiat: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: WalletState = {
  wallets: [],
  selectedCrypto: "ALL",
  selectedFiat: "USD",
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    fetchWalletStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchWalletSuccess: (state, action: PayloadAction<Wallet[]>) => {
      state.wallets = action.payload;
      state.isLoading = false;
      state.lastUpdated = new Date().toISOString();
    },
    fetchWalletFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedCrypto: (state, action: PayloadAction<string>) => {
      state.selectedCrypto = action.payload;
    },
    setSelectedFiat: (state, action: PayloadAction<string>) => {
      state.selectedFiat = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Wallet>) => {
      const index = state.wallets.findIndex(
        (wallet) => wallet.currency === action.payload.currency
      );

      if (index !== -1) {
        state.wallets[index].balance.accountBalance +=
          action.payload.balance.accountBalance;
      } else {
        state.wallets.push(action.payload);
      }
    },
  },
});

export const {
  fetchWalletStart,
  fetchWalletSuccess,
  fetchWalletFailure,
  setSelectedCrypto,
  setSelectedFiat,
  addTransaction,
} = walletSlice.actions;

export default walletSlice.reducer;
