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
  at?: string;
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
  added: string;
}

export interface Banned {
  by: string;
  reason: string;
  at: string;
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
  dateOfBirth: string | null;
  dateOfSignup: string | null;
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
  dateOfSignup: string;
  country: string;
  location: string;
  kyc: Kyc | null;
  fromThirdParty: ThirdPartySignin | null;
  altEmail: AltEmails[];
  preferences: Preferences;
  banned: Banned | null;
}

export interface VerificationStatus {
  verifId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
  location: string;
  govId: string;
  selfie: string;
  govDoc: string;
  reviewed: string;
  approved: string;
  timestamp: string | number;
  status: string;
  isMerchant: number;
}

interface AuthState {
  user: User | null;
  merchant: Merchant | null;
  token: Token | null;
  otp: Otp | null;
  verificationStatus: VerificationStatus[] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  merchant: null,
  token: null,
  otp: null,
  verificationStatus: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Helper function to parse JSON string in kyc, altEmails and banned fields and handle bigint values
const parseKycData = <T extends User | Merchant>(entity: T): T => {
  if (entity && entity.kyc && typeof entity.kyc === "string") {
    try {
      entity.kyc = JSON.parse(entity.kyc as unknown as string) as Kyc;
      if (entity.kyc.at && typeof entity.kyc.at === "bigint") {
        entity.kyc.at = BigInt(entity.kyc.at).toString();
      }
    } catch (error) {
      console.error("Failed to parse kyc data:", error);
    }
  }
  if (entity && entity.altEmail && typeof entity.altEmail === "string") {
    try {
      entity.altEmail = JSON.parse(
        entity.altEmail as unknown as string
      ) as AltEmails[];
      if (entity.altEmail.length > 0) {
        entity.altEmail = entity.altEmail.map((email) => ({
          ...email,
          added:
            typeof email.added === "bigint"
              ? BigInt(email.added).toString()
              : email.added.toString(),
        }));
      }
    } catch (error) {
      console.error("Failed to parse altEmail data:", error);
    }
  }
  if (entity && entity.banned && typeof entity.banned === "string") {
    try {
      entity.banned = JSON.parse(entity.banned as unknown as string) as Banned;
      if (entity.banned && typeof entity.banned.at === "bigint") {
        entity.banned.at = BigInt(entity.banned.at).toString();
      }
    } catch (error) {
      console.error("Failed to parse banned data:", error);
    }
  }
  if (
    entity &&
    entity.dateOfSignup &&
    typeof entity.dateOfSignup === "bigint"
  ) {
    try {
      entity.dateOfSignup = BigInt(entity.dateOfSignup).toString();
    } catch (error) {
      console.error("Failed to convert dateOfSignup bigint:", error);
    }
  }
  return entity;
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
      state.otp = action.payload.otp || null;

      // Parse kyc data if it exists as a string
      if (action.payload.user) {
        state.user = parseKycData(action.payload.user);
      }

      if (action.payload.merchant) {
        state.merchant = parseKycData(action.payload.merchant);
      }

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
      state.verificationStatus = null;
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
    setVerificationStatus: (
      state,
      action: PayloadAction<VerificationStatus[]>
    ) => {
      state.verificationStatus = action.payload;
    },
    verificationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    toggleLoading: (state) => {
      state.isLoading = !state.isLoading;
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
  setVerificationStatus,
  verificationFailure,
  toggleLoading,
} = authSlice.actions;

export default authSlice.reducer;
