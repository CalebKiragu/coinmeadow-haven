
import { createContext, useContext, useState } from "react";

type SendPayContextType = {
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  mobileAmount: string;
  setMobileAmount: (value: string) => void;
  mobilePin: string;
  setMobilePin: (value: string) => void;
  merchantNumber: string;
  setMerchantNumber: (value: string) => void;
  merchantAmount: string;
  setMerchantAmount: (value: string) => void;
  merchantPin: string;
  setMerchantPin: (value: string) => void;
  resetMobileFlow: () => void;
  resetMerchantFlow: () => void;
};

const SendPayContext = createContext<SendPayContextType | undefined>(undefined);

export const SendPayProvider = ({ children }: { children: React.ReactNode }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileAmount, setMobileAmount] = useState("");
  const [mobilePin, setMobilePin] = useState("");
  const [merchantNumber, setMerchantNumber] = useState("");
  const [merchantAmount, setMerchantAmount] = useState("");
  const [merchantPin, setMerchantPin] = useState("");

  const resetMobileFlow = () => {
    setMobileNumber("");
    setMobileAmount("");
    setMobilePin("");
  };

  const resetMerchantFlow = () => {
    setMerchantNumber("");
    setMerchantAmount("");
    setMerchantPin("");
  };

  return (
    <SendPayContext.Provider
      value={{
        mobileNumber,
        setMobileNumber,
        mobileAmount,
        setMobileAmount,
        mobilePin,
        setMobilePin,
        merchantNumber,
        setMerchantNumber,
        merchantAmount,
        setMerchantAmount,
        merchantPin,
        setMerchantPin,
        resetMobileFlow,
        resetMerchantFlow,
      }}
    >
      {children}
    </SendPayContext.Provider>
  );
};

export const useSendPay = () => {
  const context = useContext(SendPayContext);
  if (context === undefined) {
    throw new Error("useSendPay must be used within a SendPayProvider");
  }
  return context;
};
