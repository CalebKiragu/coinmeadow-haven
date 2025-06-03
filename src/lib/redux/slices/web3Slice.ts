import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Web3Wallet {
  address: string;
  chain: string;
  chainId: string | number;
  connectorName: string;
  connected?: boolean;
}

interface XMTPConfig {
  peer: string;
}

interface Web3State {
  wallet: Web3Wallet | null;
  xmtp: XMTPConfig | null;
}

const initialState: Web3State = {
  wallet: null,
  xmtp: null,
};

const web3Slice = createSlice({
  name: "web3",
  initialState,
  reducers: {
    setWeb3Wallet(state, action: PayloadAction<{ wallet: Web3Wallet }>) {
      state.wallet = action.payload.wallet;
    },
    resetWeb3Wallet(state) {
      state.wallet = null;
    },
    setXMTPConfig(state, action: PayloadAction<{ xmtp: XMTPConfig }>) {
      state.xmtp = action.payload.xmtp;
    },
    resetXMTPConfig(state) {
      state.xmtp = null;
    },
  },
});

export const {
  setWeb3Wallet,
  resetWeb3Wallet,
  setXMTPConfig,
  resetXMTPConfig,
} = web3Slice.actions;
export default web3Slice.reducer;
