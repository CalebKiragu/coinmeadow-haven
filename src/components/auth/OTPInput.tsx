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
      <p className="text-sm text-muted-foreground text-center">
        Enter the 4-digit code sent to your {identifier || "contact"}
      </p>
      <div className="flex justify-center">
        <InputOTP
          maxLength={4}
          value={value}
          onChange={onChange}
          render={({ slots }) => (
            <InputOTPGroup className="gap-2">
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