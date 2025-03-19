import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Wallets {
  walletId: string;
  currency: string;
}

export interface Kyc {
  verifId?: string;
  govId?: string;
  images?: string[];
  by?: string;
  at?: bigint;
  create?: boolean;
}

export interface ThirdPartySignin {
  app: string;
  id: string;
}

export interface Preferences {
  twoFA: boolean;
  darkMode: boolean;
}

export interface AltEmails {
  email: string;
  added: bigint;
}

export interface Banned {
  by: string;
  reason: string;
  at: bigint;
}

export interface Token {
  id: string;
  value: string;
}

export interface Otp {
  otpId?: string;
  email?: string;
  phone?: string;
  otp?: string;
}

export interface User {
  userId: string;
  userName: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wallets: Wallets[];
  profileImg: string;
  dateOfBirth: bigint | null;
  dateOfSignup: bigint | null;
  gender: "M" | "F" | "N";
  nationality: string;
  kyc: Kyc | null;
  fromThirdParty: ThirdPartySignin | null;
  altEmail: AltEmails[];
  preferences: Preferences;
  banned: Banned | null;
}

export interface Merchant {
  merchantId: string;
  merchantName: string;
  merchantNo: string;
  repName: string;
  repContact: string;
  email: string;
  phone: string;
  wallets: Wallets[];
  profileImg: string;
  dateOfIncorporation: string | null;
  dateOfSignup: bigint;
  country: string;
  location: string;
  kyc: Kyc | null;
  fromThirdParty: ThirdPartySignin | null;
  altEmail: AltEmails[];
  preferences: Preferences;
  banned: Banned | null;
}

interface AuthState {
  user: User | null;
  merchant: Merchant | null;
  token: Token | null;
  otp: Otp | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  merchant: null,
  token: null,
  otp: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user?: User;
        merchant?: Merchant;
        token?: Token;
        otp?: Otp;
      }>
    ) => {
      state.isAuthenticated = true;
      state.otp = action.payload.otp;
      state.user = action.payload.user;
      state.merchant = action.payload.merchant;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.merchant = null;
      state.token = null;
      state.otp = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateMerchant: (state, action: PayloadAction<Partial<Merchant>>) => {
      if (state.merchant) {
        state.merchant = { ...state.merchant, ...action.payload };
      }
    },
    updateOtp: (state, action: PayloadAction<Partial<Otp>>) => {
      state.otp = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  updateMerchant,
  updateOtp,
} = authSlice.actions;

export default authSlice.reducer;
