
import { useState, useEffect } from "react";
import { Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { countries } from "@/types/currency";
import ContactList from "./ContactList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipientInputProps {
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  mobileInputType: "phone" | "email";
  setMobileInputType: (value: "phone" | "email") => void;
  selectedCountryCode: string;
  setSelectedCountryCode: (value: string) => void;
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone number validation for international format
const phoneRegex = /^\d{1,10}$/;

const RecipientInput = ({
  mobileNumber,
  setMobileNumber,
  mobileInputType,
  setMobileInputType,
  selectedCountryCode,
  setSelectedCountryCode
}: RecipientInputProps) => {
  const [isValid, setIsValid] = useState(false);

  // Validate input based on type
  useEffect(() => {
    if (mobileInputType === 'email') {
      setIsValid(emailRegex.test(mobileNumber));
    } else {
      setIsValid(phoneRegex.test(mobileNumber.replace(/[^\d]/g, '')));
    }
  }, [mobileNumber, mobileInputType]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mobileInputType === 'phone') {
      // For phone, only allow digits and limit to 10 characters
      const value = e.target.value.replace(/[^\d]/g, '');
      setMobileNumber(value.substring(0, 10));
    } else {
      // For email, no special handling needed
      setMobileNumber(e.target.value);
    }
  };
  
  const handleContactSelect = (contact: any) => {
    if (mobileInputType === 'email' && contact.email && contact.email[0]) {
      setMobileNumber(contact.email[0]);
    } else if (contact.tel && contact.tel[0]) {
      // Clean up the phone number to remove non-digits
      const cleanPhone = contact.tel[0].replace(/[^\d]/g, '');
      setMobileNumber(cleanPhone.substring(0, 10));
    }
  };
  
  return (
    <div className="space-y-4">
      <Tabs 
        value={mobileInputType} 
        onValueChange={(v) => setMobileInputType(v as "phone" | "email")}
        className="w-full mb-2"
      >
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="phone" className="flex items-center gap-1">
            <Phone size={14} /> Phone
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-1">
            <Mail size={14} /> Email
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="phone" className="mt-2">
          <div className="flex gap-2">
            <Select
              value={selectedCountryCode}
              onValueChange={setSelectedCountryCode}
            >
              <SelectTrigger className="w-[90px] flex-shrink-0">
                <SelectValue placeholder="+254" />
              </SelectTrigger>
              <SelectContent>
                {/* Filter out duplicate country codes */}
                {(() => {
                  const uniqueCodes = new Set();
                  return countries.map((country) => {
                    let countryCode;
                    switch(country.code) {
                      case 'KE': countryCode = '254'; break;
                      case 'NG': countryCode = '234'; break;
                      case 'UG': countryCode = '256'; break;
                      case 'TZ': countryCode = '255'; break;
                      case 'US': countryCode = '1'; break;
                      default: return null;
                    }
                    
                    if (uniqueCodes.has(countryCode)) return null;
                    uniqueCodes.add(countryCode);
                    
                    return (
                      <SelectItem key={country.code} value={countryCode}>
                        +{countryCode}
                      </SelectItem>
                    );
                  }).filter(Boolean);
                })()}
              </SelectContent>
            </Select>
            
            <Input
              type="tel"
              placeholder="Enter phone number"
              value={mobileNumber}
              onChange={handleInputChange}
              className={`flex-grow ${!isValid && mobileNumber ? 'border-red-500' : ''}`}
              maxLength={10}
              required
            />
          </div>
          {!isValid && mobileNumber && (
            <p className="text-xs text-red-500 mt-1">Please enter a valid phone number</p>
          )}
        </TabsContent>
        
        <TabsContent value="email" className="mt-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={mobileNumber}
            onChange={handleInputChange}
            className={`${!isValid && mobileNumber ? 'border-red-500' : ''}`}
            required
          />
          {!isValid && mobileNumber && (
            <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
          )}
        </TabsContent>
      </Tabs>
      
      <ContactList 
        mobileInputType={mobileInputType}
        onContactSelect={handleContactSelect}
      />
    </div>
  );
};

export default RecipientInput;
