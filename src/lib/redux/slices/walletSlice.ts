
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'KES' | 'NGN' | 'ZAR';

export interface Wallet {
  currency: string;
  balance: {
    availableBalance: string;
    pendingBalance: string;
    totalBalance: string;
  };
}

interface WalletState {
  walletLoaded: boolean;
  walletError: string | null;
  balance: {
    available: string;
    pending: string;
    total: string;
  };
  selectedFiat: Currency;
  selectedCrypto: string;
  wallets: Wallet[];
  lastUpdated: string | null;
  showBalance: boolean;
}

const initialState: WalletState = {
  walletLoaded: false,
  walletError: null,
  balance: {
    available: '0',
    pending: '0',
    total: '0',
  },
  selectedFiat: 'USD',
  selectedCrypto: 'BTC',
  wallets: [],
  lastUpdated: null,
  showBalance: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    fetchWalletStart: (state) => {
      state.walletLoaded = false;
      state.walletError = null;
    },
    fetchWalletSuccess: (state, action: PayloadAction<Wallet[]>) => {
      state.walletLoaded = true;
      state.wallets = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.walletError = null;
      
      // Calculate total balance values
      const totalAvailable = state.wallets.reduce(
        (sum, wallet) => sum + parseFloat(wallet.balance.availableBalance), 
        0
      ).toString();
      
      const totalPending = state.wallets.reduce(
        (sum, wallet) => sum + parseFloat(wallet.balance.pendingBalance), 
        0
      ).toString();
      
      const totalBalance = state.wallets.reduce(
        (sum, wallet) => sum + parseFloat(wallet.balance.totalBalance), 
        0
      ).toString();
      
      state.balance = {
        available: totalAvailable,
        pending: totalPending,
        total: totalBalance,
      };
    },
    fetchWalletFailure: (state, action: PayloadAction<string>) => {
      state.walletLoaded = true;
      state.walletError = action.payload;
    },
    updateFiatCurrency: (state, action: PayloadAction<Currency>) => {
      state.selectedFiat = action.payload;
    },
    setSelectedCrypto: (state, action: PayloadAction<string>) => {
      state.selectedCrypto = action.payload;
    },
    setSelectedFiat: (state, action: PayloadAction<Currency>) => {
      state.selectedFiat = action.payload;
    },
    setShowBalance: (state, action: PayloadAction<boolean>) => {
      state.showBalance = action.payload;
    },
    toggleShowBalance: (state) => {
      state.showBalance = !state.showBalance;
    },
  },
});

export const {
  fetchWalletStart,
  fetchWalletSuccess,
  fetchWalletFailure,
  updateFiatCurrency,
  setSelectedCrypto,
  setSelectedFiat,
  setShowBalance,
  toggleShowBalance,
} = walletSlice.actions;

export default walletSlice.reducer;
