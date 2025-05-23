import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/types/currency";
import { useEffect, useState } from "react";

type SignupFormFieldsProps = {
  country: string;
  setCountry: (value: string) => void;
  refId: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setPin: (value: string) => void;
  setRefId: (value: string) => void;
};

const SignupFormFields = ({
  country,
  setCountry,
  refId,
  setFirstName,
  setLastName,
  setPin,
  setRefId,
}: SignupFormFieldsProps) => {
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
          placeholder="First Name"
          className="bg-white/50"
          required
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Last Name"
          className="bg-white/50"
          required
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <Select value={country} onValueChange={setCountry}>
        <SelectTrigger className="w-full bg-white/50">
          <SelectValue placeholder="Select Country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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

export default SignupFormFields;
