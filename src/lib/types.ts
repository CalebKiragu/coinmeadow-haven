export interface GoogleAuthPayload {
  token: string;
  type: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  otp?: string;
  otpId?: string;
  pin: string;
}

export interface LoginResponse {
  user?: any;
  merchant?: any;
  token?: any;
}

export interface UserRegistrationPayload {
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  pin: string;
  otpId: string;
  refId?: string;
}

export interface MerchantRegistrationPayload {
  email?: string;
  phone?: string;
  merchantName: string;
  repName: string;
  repContact: string;
  pin: string;
  otpId: string;
  refId?: string;
}

export interface UserResponse {
  userId: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  kyc?: any;
}

export interface MerchantResponse {
  merchantId: string;
  merchantNo?: string;
  email?: string;
  phone?: string;
  merchantName: string;
  repName: string;
  repContact: string;
  createdAt: string;
  updatedAt: string;
  kyc?: any;
}

export interface OtpVerificationResponse {
  otpId?: string;
  success?: boolean;
  msg?: string;
}
