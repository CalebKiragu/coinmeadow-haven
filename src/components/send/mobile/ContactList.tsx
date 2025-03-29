
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Contact {
  name: string[];
  tel?: string[];
  email?: string[];
}

interface ContactListProps {
  mobileInputType: "phone" | "email";
  onContactSelect: (contact: any) => void;
}

const ContactList = ({ mobileInputType, onContactSelect }: ContactListProps) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
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
  
  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const name = contact.name[0]?.toLowerCase() || '';
    const phone = contact.tel?.[0]?.toLowerCase() || '';
    const email = contact.email?.[0]?.toLowerCase() || '';
    
    return name.includes(query) || phone.includes(query) || email.includes(query);
  });
  
  if (!hasContactsPermission || mobileInputType !== 'phone') {
    return null;
  }
  
  return (
    <>
      <div className="relative">
        <Input
          type="search"
          placeholder="Search contacts"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      </div>
      <div className="h-48 overflow-y-auto glass-effect p-3 rounded-lg">
        {loading ? (
          <div className="text-center py-4">
            Loading contacts...
          </div>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer"
              onClick={() => onContactSelect(contact)}
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
  );
};

export default ContactList;
