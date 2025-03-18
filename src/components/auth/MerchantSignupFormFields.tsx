import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

type MerchantSignupFormFieldsProps = {
  refId: string;
  setMerchantName: (value: string) => void;
  setRepName: (value: string) => void;
  setRepContact: (value: string) => void;
  setPin: (value: string) => void;
  setRefId: (value: string) => void;
};

const MerchantSignupFormFields = ({
  refId,
  setMerchantName,
  setRepName,
  setRepContact,
  setPin,
  setRefId,
}: MerchantSignupFormFieldsProps) => {
  const [tentativePin, setTentativePin] = useState("");
  const [confirmedPin, setConfirmedPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (confirmedPin !== tentativePin) return setError("PIN does not match!");
    if (confirmedPin === tentativePin) setError("");
    setPin(confirmedPin);
  }, [confirmedPin]);

  const updatePin = (newPin: string): void => {
    setConfirmedPin(newPin);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          placeholder="Merchant Name"
          className="bg-white/50"
          required
          onChange={(e) => setMerchantName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Representative Name"
          className="bg-white/50"
          required
          onChange={(e) => setRepName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Representative Contact"
          className="bg-white/50"
          required
          onChange={(e) => setRepContact(e.target.value)}
        />
      </div>

      <Input
        type="password"
        placeholder="PIN"
        className="w-full bg-white/50"
        required
        onChange={(e) => setTentativePin(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Confirm PIN"
        className="w-full bg-white/50"
        required
        onChange={(e) => updatePin(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Input
        type="text"
        placeholder="Referral ID (Optional)"
        defaultValue={refId}
        className="w-full bg-white/50"
        onChange={(e) => setRefId(e.target.value)}
      />
    </div>
  );
};

export default MerchantSignupFormFields;
