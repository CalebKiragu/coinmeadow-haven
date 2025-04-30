
import React, { useRef, useEffect } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on the input field when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
          autoFocus
          ref={inputRef}
          render={({ slots }) => (
            <InputOTPGroup className="gap-3">
              {slots.map((slot, index) => (
                <InputOTPSlot 
                  key={index} 
                  {...slot} 
                  index={index} 
                  className="cursor-text focus:ring-2 focus:ring-primary"
                />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
    </div>
  );
};

export default OTPInput;
