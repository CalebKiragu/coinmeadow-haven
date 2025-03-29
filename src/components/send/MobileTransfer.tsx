
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSendPay } from "@/contexts/SendPayContext";
import { useToast } from "@/components/ui/use-toast";

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
    setMobilePin
  } = useSendPay();
  
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);

  // Check if contacts API is available
  useEffect(() => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      setHasContactsPermission(true);
      fetchContacts();
    }
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      if ('contacts' in navigator && 'select' in (navigator.contacts as any)) {
        const contactsApi = navigator.contacts as any;
        const contacts = await contactsApi.select(
          ['name', 'tel'],
          { multiple: true }
        );
        setContacts(contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error accessing contacts",
        description: "We couldn't access your contacts. Please enter the phone number manually.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (phoneNumber: string) => {
    setMobileNumber(phoneNumber);
  };

  if (currentStep === 1) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Input
          type="tel"
          placeholder="Enter phone number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
        />
        
        {hasContactsPermission && (
          <>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search contacts"
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
            <div className="h-64 overflow-y-auto glass-effect p-4 rounded-lg">
              {loading ? (
                <div className="text-center py-4">Loading contacts...</div>
              ) : contacts.length > 0 ? (
                contacts.map((contact, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer"
                    onClick={() => handleContactSelect(contact.tel[0])}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      {contact.name[0]?.charAt(0) || String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {contact.name[0] || `Contact ${i + 1}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.tel[0] || "+XXX XXX XXX XXX"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  {hasContactsPermission ? "No contacts found" : "Please enter phone number manually"}
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
        <Input
          type="number"
          placeholder="Enter amount"
          value={mobileAmount}
          onChange={(e) => setMobileAmount(e.target.value)}
          required
        />
      </div>
    );
  }
  
  if (currentStep === 3) {
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
