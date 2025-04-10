
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'KES' | 'NGN' | 'ZAR';

interface WalletState {
  walletLoaded: boolean;
  walletError: string | null;
  balance: {
    available: string;
    pending: string;
    total: string;
  };
  selectedFiat: Currency;
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
    fetchWalletSuccess: (state, action: PayloadAction<{ available: string; pending: string; total: string }>) => {
      state.walletLoaded = true;
      state.balance = action.payload;
      state.walletError = null;
    },
    fetchWalletFailure: (state, action: PayloadAction<string>) => {
      state.walletLoaded = true;
      state.walletError = action.payload;
    },
    updateFiatCurrency: (state, action: PayloadAction<Currency>) => {
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
  setShowBalance,
  toggleShowBalance,
} = walletSlice.actions;

export default walletSlice.reducer;
