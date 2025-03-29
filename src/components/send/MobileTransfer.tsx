
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone } from "lucide-react";
import { useSendPay } from "@/contexts/SendPayContext";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { countries } from "@/types/currency";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cryptoCurrencies, fiatCurrencies } from "@/types/currency";
import { Skeleton } from "@/components/ui/skeleton";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone number validation for international format
const phoneRegex = /^\d{1,15}$/;

export const MobileTransfer = ({
  currentStep,
}: {
  currentStep: number;
}) => {
  const { toast } = useToast();
  const { 
    mobileNumber, 
    setMobileNumber,
    mobileAmount,
    setMobileAmount,
    mobilePin,
    setMobilePin,
    mobileInputType,
    setMobileInputType,
    selectedCryptoCurrency,
    setSelectedCryptoCurrency,
    selectedFiatCurrency,
    setSelectedFiatCurrency,
    isCryptoAmount,
    setIsCryptoAmount,
    selectedCountryCode,
    setSelectedCountryCode,
    convertCryptoToFiat,
    convertFiatToCrypto,
    rates,
    isLoading
  } = useSendPay();
  
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);
  const [localAmount, setLocalAmount] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Validate recipient input
  useEffect(() => {
    if (mobileInputType === 'email') {
      setIsValid(emailRegex.test(mobileNumber));
    } else {
      setIsValid(phoneRegex.test(mobileNumber.replace(/[^\d]/g, '')));
    }
  }, [mobileNumber, mobileInputType]);

  // Check if contacts API is available
  useEffect(() => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      setHasContactsPermission(true);
      fetchContacts();
    }
  }, []);

  // Handle amount changes for conversions
  useEffect(() => {
    if (localAmount && !isLoading) {
      if (isCryptoAmount) {
        setMobileAmount(localAmount);
      } else {
        const cryptoAmount = convertFiatToCrypto(
          localAmount,
          selectedCryptoCurrency,
          selectedFiatCurrency
        );
        setMobileAmount(cryptoAmount);
      }
    }
  }, [localAmount, isCryptoAmount, selectedCryptoCurrency, selectedFiatCurrency, rates]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      if ('contacts' in navigator && 'select' in (navigator.contacts as any)) {
        const contactsApi = navigator.contacts as any;
        const contacts = await contactsApi.select(
          ['name', 'tel', 'email'],
          { multiple: true }
        );
        setContacts(contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error accessing contacts",
        description: "We couldn't access your contacts. Please enter the contact manually.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (contact: any) => {
    if (mobileInputType === 'email' && contact.email && contact.email[0]) {
      setMobileNumber(contact.email[0]);
    } else if (contact.tel && contact.tel[0]) {
      // Clean up the phone number to remove non-digits
      const cleanPhone = contact.tel[0].replace(/[^\d]/g, '');
      setMobileNumber(cleanPhone);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mobileInputType === 'phone') {
      // For phone, only allow digits
      const value = e.target.value.replace(/[^\d]/g, '');
      setMobileNumber(value);
    } else {
      // For email, no special handling needed
      setMobileNumber(e.target.value);
    }
  };

  if (currentStep === 1) {
    return (
      <div className="space-y-4 animate-fade-in">
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
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem 
                      key={country.code} 
                      value={country.code === 'KE' ? '254' : 
                             country.code === 'NG' ? '234' : 
                             country.code === 'UG' ? '256' : 
                             country.code === 'TZ' ? '255' : 
                             country.code === 'US' ? '1' : '254'}
                    >
                      {country.name} ({country.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={mobileNumber}
                onChange={handleInputChange}
                className={`flex-grow ${!isValid && mobileNumber ? 'border-red-500' : ''}`}
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
        
        {hasContactsPermission && mobileInputType === 'phone' && (
          <>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search contacts"
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
            <div className="h-48 overflow-y-auto glass-effect p-3 rounded-lg">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : contacts.length > 0 ? (
                contacts.map((contact, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer"
                    onClick={() => handleContactSelect(contact)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      {contact.name[0]?.charAt(0) || String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {contact.name[0] || `Contact ${i + 1}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.tel && contact.tel[0] ? contact.tel[0] : 
                         contact.email && contact.email[0] ? contact.email[0] : 
                         "No contact info"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  {hasContactsPermission ? "No contacts found" : "Please enter contact manually"}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
  
  if (currentStep === 2) {
    return (
      <div className="space-y-4 animate-fade-in">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="flex gap-2 items-center">
              <Select
                value={isCryptoAmount ? "crypto" : "fiat"}
                onValueChange={(value) => setIsCryptoAmount(value === "crypto")}
              >
                <SelectTrigger className="w-[90px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="fiat">Fiat</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder={`Enter amount in ${isCryptoAmount ? selectedCryptoCurrency : selectedFiatCurrency}`}
                value={localAmount}
                onChange={(e) => setLocalAmount(e.target.value)}
                required
                className="flex-grow"
              />
              
              <Select
                value={isCryptoAmount ? selectedCryptoCurrency : selectedFiatCurrency}
                onValueChange={(value) => {
                  if (isCryptoAmount) {
                    setSelectedCryptoCurrency(value);
                  } else {
                    setSelectedFiatCurrency(value);
                  }
                }}
              >
                <SelectTrigger className="w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isCryptoAmount ? 
                    cryptoCurrencies.map((crypto) => (
                      <SelectItem key={crypto.symbol} value={crypto.symbol}>
                        {crypto.symbol}
                      </SelectItem>
                    )) : 
                    fiatCurrencies.map((fiat) => (
                      <SelectItem key={fiat.code} value={fiat.code}>
                        {fiat.code}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            {localAmount && (
              <div className="text-sm bg-white/10 p-2 rounded-lg">
                {isCryptoAmount ? (
                  <p>
                    ≈ {convertCryptoToFiat(localAmount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedFiatCurrency}
                    <span className="block text-xs text-gray-400 mt-1">
                      1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || '0.00'} {selectedFiatCurrency}
                    </span>
                  </p>
                ) : (
                  <p>
                    ≈ {convertFiatToCrypto(localAmount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedCryptoCurrency}
                    <span className="block text-xs text-gray-400 mt-1">
                      1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || '0.00'} {selectedFiatCurrency}
                    </span>
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
  
  if (currentStep === 3) {
    const fiatEquivalent = convertCryptoToFiat(
      mobileAmount,
      selectedCryptoCurrency,
      selectedFiatCurrency
    );
    
    return (
      <div className="space-y-4 animate-fade-in">
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
  }

  return null;
};
