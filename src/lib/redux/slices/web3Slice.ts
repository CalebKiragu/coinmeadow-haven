import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Prompt {
  amount: number;
  currency: string;
  recipient?: string;
  sender?: string;
  type: string;
}

interface Web3Wallet {
  address: string;
  chain: string;
  chainId: string | number;
  connectorName: string;
  connected?: boolean;
}

interface ConfirmPrompt {
  openDialog: boolean;
  prompt: Prompt | null;
}

interface XMTPConfig {
  peer: string;
}

interface Web3State {
  wallet: Web3Wallet | null;
  xmtp: XMTPConfig | null;
  prompt: ConfirmPrompt | null;
}

const initialState: Web3State = {
  wallet: null,
  xmtp: null,
  prompt: null,
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
    triggerPrompt(state, action: PayloadAction<{ prompt: ConfirmPrompt }>) {
      state.prompt = action.payload.prompt;
    },
    cancelPrompt(state) {
      state.prompt = { openDialog: false, prompt: null };
    },
  },
});

export const {
  setWeb3Wallet,
  resetWeb3Wallet,
  setXMTPConfig,
  resetXMTPConfig,
  triggerPrompt,
  cancelPrompt,
} = web3Slice.actions;

export default web3Slice.reducer;
