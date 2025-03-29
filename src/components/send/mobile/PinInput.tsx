
import { Input } from "@/components/ui/input";
import { useSendPay } from "@/contexts/SendPayContext";

const PinInput = () => {
  const { mobilePin, setMobilePin } = useSendPay();
  
  return (
    <div className="space-y-4">
      <Input
        type="password"
        placeholder="Enter PIN"
        value={mobilePin}
        onChange={(e) => setMobilePin(e.target.value)}
        maxLength={4}
        required
      />
    </div>
  );
};

export default PinInput;
