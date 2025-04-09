import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Recipient {
  address: string;
  amount: string;
  currency: string;
  basePair: string;
}

export interface Fee {
  fiat: number;
  crypto: number;
}

export interface TxIds {
  ref: string;
  blockchain: string;
}

export interface Transaction {
  type: "SEND" | "RECEIVE" | "DEPOSIT" | "WITHDRAW" | "BCWITHDRAW";
  userId: string;
  sender: string;
  recipient: Recipient[];
  txId: string;
  inOut: string;
  grossValue: string;
  grossCurrency: string;
  netValue: string;
  netCurrency: string;
  fee: Fee[] | Fee | null | undefined;
  status: "INPROGRESS" | "CONFIRMED" | "SETTLED" | "CANCELLED";
  timestamp: bigint;
  updatedAt: bigint;
  ids: TxIds | string;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    fetchTransactionsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTransactionsSuccess: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.isLoading = false;
    },
    fetchTransactionsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addNewTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
  },
});

export const {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  addNewTransaction,
} = transactionSlice.actions;

export default transactionSlice.reducer;
