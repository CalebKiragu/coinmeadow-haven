
import React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
  identifier?: string;
};

const OTPInput = ({ value, onChange, identifier }: OTPInputProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/80 text-center font-medium">
        Enter the 4-digit code sent to {identifier || "your contact"}
      </p>
      <div className="flex justify-center">
        <InputOTP
          value={value}
          onChange={onChange}
          maxLength={4}
          pattern="\d{4}"
          render={({ slots }) => (
            <InputOTPGroup className="gap-3">
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} index={index} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
    </div>
  );
};

export default OTPInput;
