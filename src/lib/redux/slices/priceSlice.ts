import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PriceData {
  basePair: string;
  source: string;
  timestamp: string;
  value: string;
  date: string;
  currency: string;
  batchId: string;
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

const parseTimestamps = <T extends PriceData[]>(entity: T): PriceData[] => {
  if (!entity || entity.length === 0) return [];

  try {
    return entity.map((priceObj) => ({
      ...priceObj,
      timestamp:
        typeof priceObj.timestamp === "bigint"
          ? BigInt(priceObj.timestamp).toString()
          : priceObj.timestamp.toString(),
    }));
  } catch (error) {
    console.error("Failed to parse price timestamps data:", error);
    return entity;
  }
};

const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {
    fetchPricesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPricesSuccess: (state, action: PayloadAction<PriceData[]>) => {
      if (action.payload.length > 0)
        state.prices = parseTimestamps(action.payload);

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
        state.prices[index] = parseTimestamps([action.payload])[0];
      } else {
        state.prices.push(parseTimestamps([action.payload])[0]);
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
