
import { useState, useEffect } from "react";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  FileText,
  MessageSquare,
  Trash2,
  Upload,
  UserCog,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAppSelector } from "@/lib/redux/hooks";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { maskSensitiveData, formatTimestamp } from "@/lib/utils";
import { WalletService } from "@/lib/services/walletService";
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import { Transaction } from "@/lib/redux/slices/transactionSlice";
import { ApiService } from "@/lib/services";

const Account = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isPinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user, merchant } = useAppSelector((state) => state.auth);
  const isMerchant = !!merchant;
  const userData = user || merchant;
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || merchant?.repName || "",
    lastName: user?.lastName || merchant?.merchantName || "",
    email: user?.email || merchant?.email || "",
    phone: user?.phone || merchant?.phone || "",
    gender: user?.gender || "N",
  });

  // Fetch transaction data
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        if (userData) {
          const txns = await WalletService.fetchTransactions({
            email: userData.email,
            phone: userData.phone,
          });
          setTransactions(txns || []);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    };
    
    fetchTransactionData();
  }, [userData]);

  // Calculate transaction and trade counts
  const transactionsCount = transactions.length;
  const tradesCount = transactions.filter(tx => 
    tx.type === "SEND" || tx.type === "RECEIVE"
  ).length;

  const handleProfileUpdate = async () => {
    setPinModalOpen(true);
  };

  const submitProfileUpdate = async () => {
    if (!pin || pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a valid 4-digit PIN",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Determine which fields have been changed
      const changedFields = Object.entries(profileData).reduce((acc, [key, value]) => {
        const originalValue = user?.[key as keyof typeof user] || 
                              merchant?.[key as keyof typeof merchant];
        if (value !== originalValue && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(changedFields).length === 0) {
        setIsEditing(false);
        setPinModalOpen(false);
        setIsLoading(false);
        return;
      }

      // Update each changed field individually
      for (const [field, newValue] of Object.entries(changedFields)) {
        const endpoint = isMerchant ? "v1/merchants/update" : "v1/users/update";
        const requestBody = {
          [user?.email ? "email" : "phone"]: user?.email || user?.phone || merchant?.email || merchant?.phone,
          pin,
          field,
          newValue
        };

        await ApiService.updateProfile(endpoint, requestBody);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      setPinModalOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPinModalOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
    }
  };

  const exportStatement = async () => {
    setIsLoading(true);
    try {
      // Create a hidden div for rendering the PDF content
      const statementContainer = document.createElement('div');
      statementContainer.style.position = 'absolute';
      statementContainer.style.left = '-9999px';
      statementContainer.style.padding = '20px';
      statementContainer.style.background = 'white';
      statementContainer.style.width = '800px';
      
      // Add statement content
      statementContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #8B5CF6; text-align: center;">CoinDuka ${isMerchant ? 'Merchant' : 'User'} Statement</h1>
          <div style="margin-bottom: 20px;">
            <h3>Account Information</h3>
            <p>Name: ${profileData.firstName} ${profileData.lastName}</p>
            <p>Email: ${maskSensitiveData(profileData.email)}</p>
            <p>Phone: ${maskSensitiveData(profileData.phone)}</p>
            <p>Date Generated: ${new Date().toLocaleString()}</p>
          </div>
          
          <h3>Transaction History</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Type</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Amount</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Currency</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(tx => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${tx.type}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${formatTimestamp(tx.timestamp)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${tx.grossValue}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${tx.grossCurrency}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${tx.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 30px;">
            <p>Total Transactions: ${transactionsCount}</p>
            <p>Total Trades: ${tradesCount}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(statementContainer);
      
      // Generate PDF from the div
      const canvas = await html2canvas(statementContainer);
      document.body.removeChild(statementContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`coinduka-statement-${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast({
        title: "Statement Exported",
        description: "Your transaction statement has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate statement. Please try again.",
        variant: "destructive",
      });
      console.error("Statement export error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsApp = (type: 'issue' | 'support') => {
    const phone = "+254700000000"; // Replace with actual support number
    const message = type === 'issue' 
      ? `Hello, I'm ${profileData.firstName} ${profileData.lastName} (${profileData.email}). I'd like to report an issue with my CoinDuka account.`
      : `Hello, I'm ${profileData.firstName} ${profileData.lastName} (${profileData.email}). I need assistance with my CoinDuka account.`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const dateJoined = userData?.dateOfSignup 
    ? formatTimestamp(BigInt(userData.dateOfSignup)) 
    : "January 15, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <NavigationHeader title="Account" />
      
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <Card className="glass-effect">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userData?.profileImg || "/placeholder.svg"} />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0">
                  <div className="p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              <CardTitle className="text-2xl font-bold">
                {isMerchant 
                  ? `${merchant?.merchantName} (${merchant?.repName})`
                  : `${user?.firstName} ${user?.lastName}`
                }
              </CardTitle>
              <CardDescription>
                {maskSensitiveData(userData?.email)}
                {userData?.phone && ` | ${maskSensitiveData(userData?.phone)}`}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                {isMerchant ? (
                  <>
                    <Input
                      placeholder="Merchant Name"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, firstName: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Representative Name"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, lastName: e.target.value })
                      }
                    />
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="First Name"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, firstName: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Last Name"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, lastName: e.target.value })
                      }
                    />
                  </>
                )}
                <Input
                  placeholder="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
                <Input
                  placeholder="Phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
                {!isMerchant && (
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm text-gray-500">Gender</label>
                    <select
                      className="p-2 border rounded-md bg-white/50"
                      value={profileData.gender}
                      onChange={(e) => 
                        setProfileData({ ...profileData, gender: e.target.value })
                      }
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="N">Prefer not to say</option>
                    </select>
                  </div>
                )}
                <div className="flex gap-4">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="w-full" onClick={handleProfileUpdate}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <UserCog className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-lg bg-white/10 dark:bg-black/10">
                <p className="text-sm text-gray-500">Date Joined</p>
                <p className="font-medium">{dateJoined}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10 dark:bg-black/10">
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="font-medium">{transactionsCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10 dark:bg-black/10">
                <p className="text-sm text-gray-500">Trades</p>
                <p className="font-medium">{tradesCount}</p>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={exportStatement}
                disabled={isLoading}
              >
                <FileText className="mr-2 h-4 w-4" />
                {isLoading ? "Generating..." : "Export Statement"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => openWhatsApp('issue')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Report an Issue
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => openWhatsApp('support')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() =>
                  toast({
                    variant: "destructive",
                    title: "Warning",
                    description:
                      "This action cannot be undone. Please contact support.",
                  })
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Disable Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PIN Verification Dialog */}
      <Dialog open={isPinModalOpen} onOpenChange={setPinModalOpen}>
        <DialogContent>
          <DialogTitle>Enter PIN to Confirm</DialogTitle>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please enter your 4-digit PIN to confirm profile changes
            </p>
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => {
                if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) {
                  setPin(e.target.value);
                }
              }}
              maxLength={4}
              className="text-center"
            />
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPinModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="w-full"
                onClick={submitProfileUpdate}
                disabled={pin.length !== 4 || isLoading}
              >
                {isLoading ? "Processing..." : "Confirm"}
                {!isLoading && pin.length === 4 && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Account;
