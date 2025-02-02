import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const OTPInput = ({ value, onChange }: OTPInputProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        Enter the 4-digit code sent to your {value.includes("@") ? "email" : "phone"}
      </p>
      <InputOTP
        maxLength={4}
        value={value}
        onChange={onChange}
        render={({ slots }) => (
          <InputOTPGroup className="gap-2 justify-center">
            {slots.map((slot, index) => (
              <InputOTPSlot key={index} {...slot} index={index} />
            ))}
          </InputOTPGroup>
        )}
      />
    </div>
  );
};

export default OTPInput;