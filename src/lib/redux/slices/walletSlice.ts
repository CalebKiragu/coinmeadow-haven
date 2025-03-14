
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletBalance {
  currency: string;
  amount: number;
}

interface WalletState {
  balances: WalletBalance[];
  selectedCrypto: string;
  selectedFiat: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: WalletState = {
  balances: [],
  selectedCrypto: 'ALL',
  selectedFiat: 'USD',
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    fetchBalanceStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchBalanceSuccess: (state, action: PayloadAction<WalletBalance[]>) => {
      state.balances = action.payload;
      state.isLoading = false;
      state.lastUpdated = new Date().toISOString();
    },
    fetchBalanceFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedCrypto: (state, action: PayloadAction<string>) => {
      state.selectedCrypto = action.payload;
    },
    setSelectedFiat: (state, action: PayloadAction<string>) => {
      state.selectedFiat = action.payload;
    },
    addTransaction: (state, action: PayloadAction<WalletBalance>) => {
      const index = state.balances.findIndex(
        (balance) => balance.currency === action.payload.currency
      );
      
      if (index !== -1) {
        state.balances[index].amount += action.payload.amount;
      } else {
        state.balances.push(action.payload);
      }
    },
  },
});

export const {
  fetchBalanceStart,
  fetchBalanceSuccess,
  fetchBalanceFailure,
  setSelectedCrypto,
  setSelectedFiat,
  addTransaction,
} = walletSlice.actions;

export default walletSlice.reducer;
