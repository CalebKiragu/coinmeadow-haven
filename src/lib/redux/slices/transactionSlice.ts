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
  timestamp: string;
  updatedAt: string;
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

const parseBigIntValues = <T extends Transaction[]>(
  entity: T
): Transaction[] => {
  if (!entity || entity.length === 0) return [];

  try {
    return entity.map((txObj) => ({
      ...txObj,
      timestamp:
        typeof txObj.timestamp === "bigint"
          ? BigInt(txObj.timestamp).toString()
          : txObj.timestamp.toString(),
      updatedAt:
        typeof txObj.updatedAt === "bigint"
          ? BigInt(txObj.updatedAt).toString()
          : txObj.updatedAt.toString(),
    }));
  } catch (error) {
    console.error("Failed to parse transaction bigint values:", error);
    return entity;
  }
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
      if (action.payload.length > 0)
        state.transactions = parseBigIntValues(action.payload);
      state.isLoading = false;
    },
    fetchTransactionsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addNewTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(parseBigIntValues([action.payload])[0]);
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
