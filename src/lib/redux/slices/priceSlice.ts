
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PriceData {
  currency: string;
  price: number;
  priceChange24h: number;
  lastUpdated: string;
}

interface PriceState {
  prices: PriceData[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PriceState = {
  prices: [],
  isLoading: false,
  error: null,
};

const priceSlice = createSlice({
  name: 'price',
  initialState,
  reducers: {
    fetchPricesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPricesSuccess: (state, action: PayloadAction<PriceData[]>) => {
      state.prices = action.payload;
      state.isLoading = false;
    },
    fetchPricesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updatePrice: (state, action: PayloadAction<PriceData>) => {
      const index = state.prices.findIndex(
        (price) => price.currency === action.payload.currency
      );
      
      if (index !== -1) {
        state.prices[index] = action.payload;
      } else {
        state.prices.push(action.payload);
      }
    },
  },
});

export const {
  fetchPricesStart,
  fetchPricesSuccess,
  fetchPricesFailure,
  updatePrice,
} = priceSlice.actions;

export default priceSlice.reducer;
