
import React, { useState, useEffect } from "react";

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
  identifier?: string;
};

const OTPInput = ({ value, onChange, identifier }: OTPInputProps) => {
  const [otp, setOtp] = useState(value || "");
  
  // Update parent state when internal state changes
  useEffect(() => {
    onChange(otp);
  }, [otp, onChange]);

  // Handle input change - only allow numbers and limit to 4 characters
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow numeric input and max 4 digits
    if (/^\d*$/.test(input) && input.length <= 4) {
      setOtp(input);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/80 text-center font-medium">
        Enter the 4-digit code sent to {identifier || "your contact"}
      </p>
      <div className="flex justify-center">
        <div className="flex space-x-4">
          {/* Single input for OTP */}
          <div className="relative">
            <input
              type="text"
              value={otp}
              onChange={handleChange}
              placeholder="Enter 4-digit code"
              className="w-40 text-center py-2 px-4 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={4}
            />
            
            {/* Visual representation of the 4 digits */}
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none">
              <div className="flex space-x-2">
                {Array(4).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-6 h-8 flex items-center justify-center text-lg font-bold"
                  >
                    {otp[i] || ""}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPInput;
