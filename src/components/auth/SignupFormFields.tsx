import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/types/currency";

type SignupFormFieldsProps = {
  country: string;
  setCountry: (value: string) => void;
};

const SignupFormFields = ({ country, setCountry }: SignupFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          placeholder="First Name"
          className="bg-white/50"
          required
        />
        <Input
          type="text"
          placeholder="Last Name"
          className="bg-white/50"
          required
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
        placeholder="Password"
        className="w-full bg-white/50"
        required
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        className="w-full bg-white/50"
        required
      />
    </div>
  );
};

export default SignupFormFields;