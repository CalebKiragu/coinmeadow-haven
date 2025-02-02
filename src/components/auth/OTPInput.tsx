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
          maxLength={4}
          value={value}
          onChange={onChange}
          render={({ slots }) => (
            <InputOTPGroup className="gap-2">
              {slots.map((slot, index) => (
                <InputOTPSlot
                  key={index}
                  {...slot}
                  index={index}
                  className="w-10 h-10 text-lg border-2 focus:border-coffee bg-white dark:bg-black/80 text-foreground z-50 relative"
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