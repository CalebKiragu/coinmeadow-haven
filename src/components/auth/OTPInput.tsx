import { TextField } from "@mui/material";
import { useRef, useEffect } from "react";

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
  identifier?: string;
};

const OTPInput = ({ value, onChange, identifier }: OTPInputProps) => {
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, digit: string) => {
    if (digit.length <= 1 && /^\d*$/.test(digit)) {
      const newValue = value.split('');
      newValue[index] = digit;
      onChange(newValue.join(''));
      
      if (digit && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/80 text-center font-medium">
        Enter the 4-digit code sent to {identifier || "your contact"}
      </p>
      <div className="flex justify-center gap-2">
        {[0, 1, 2, 3].map((index) => (
          <TextField
            key={index}
            inputRef={inputRefs[index]}
            variant="outlined"
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            inputProps={{
              maxLength: 1,
              style: { 
                width: '40px', 
                height: '40px',
                textAlign: 'center',
                fontSize: '1.25rem',
                padding: '8px'
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default OTPInput;