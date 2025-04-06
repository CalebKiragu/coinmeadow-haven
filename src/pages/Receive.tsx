
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, QrCode, RefreshCw, MoreVertical, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { ApiService } from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";
import { cryptoCurrencies } from "@/types/currency";
import { QRCodeSVG } from "qrcode.react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Receive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState(
    cryptoCurrencies[0].symbol
  );
  const [depositAddress, setDepositAddress] = useState("");
  const [previousAddresses, setPreviousAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  const [showFreshAddressDialog, setShowFreshAddressDialog] = useState(false);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const merchant = useSelector((state: RootState) => state.auth.merchant);
  const userIdentifier = user?.email || user?.phone || merchant?.email || merchant?.phone || "";
  const isMerchant = !!merchant;

  useEffect(() => {
    if (userIdentifier) {
      fetchDepositAddress(selectedCrypto);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to generate deposit addresses",
      });
      navigate("/login");
    }
  }, [selectedCrypto, userIdentifier]);

  const fetchDepositAddress = async (currency: string) => {
    try {
      setIsLoading(true);
      setIsFetchingAddresses(true);
      
      // Fetch previously generated addresses
      const addresses = await ApiService.getDepositAddresses({
        userIdentifier,
        currency,
        isMerchant
      });
      
      setPreviousAddresses(addresses);
      
      // If there are previous addresses, use the first one as the current address
      if (addresses.length > 0) {
        setDepositAddress(addresses[0]);
      } else {
        // If no previous addresses, generate a new one
        const address = await ApiService.generateDepositAddress({
          userIdentifier,
          currency,
          isMerchant,
          fresh: false
        });
        
        setDepositAddress(address);
      }
    } catch (error) {
      console.error("Error fetching deposit address:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deposit address. Please try again later.",
      });
      setDepositAddress("");
    } finally {
      setIsLoading(false);
      setIsFetchingAddresses(false);
    }
  };

  const generateFreshAddress = async () => {
    try {
      setIsLoading(true);
      
      const address = await ApiService.generateDepositAddress({
        userIdentifier,
        currency: selectedCrypto,
        isMerchant,
        fresh: true
      });
      
      setDepositAddress(address);
      
      // Refresh the list of addresses
      const addresses = await ApiService.getDepositAddresses({
        userIdentifier,
        currency: selectedCrypto,
        isMerchant
      });
      
      setPreviousAddresses(addresses);
      
      toast({
        title: "Success",
        description: "New deposit address generated successfully",
      });
    } catch (error) {
      console.error("Error generating fresh address:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate a new deposit address. Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setShowFreshAddressDialog(false);
    }
  };

  const handleCopy = async () => {
    if (!depositAddress) return;
    
    try {
      await navigator.clipboard.writeText(depositAddress);
      toast({
        title: "Address copied!",
        description: "The deposit address has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy address to clipboard.",
      });
    }
  };

  const getCryptoDetails = (symbol: string) => {
    const crypto = cryptoCurrencies.find(c => c.symbol === symbol);
    return crypto?.details || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <NavigationHeader title="Receive" />

      {isLoading ? (
        <div className="max-w-md mx-auto glass-effect p-6 rounded-lg space-y-6 animate-pulse">
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <Skeleton className="w-48 h-48" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="max-w-md mx-auto glass-effect p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-200">
                Select Cryptocurrency
              </label>
              <div className="flex items-center gap-2 mt-2">
                <Select
                  value={selectedCrypto}
                  onValueChange={setSelectedCrypto}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoCurrencies.map((crypto) => (
                      <SelectItem key={crypto.symbol} value={crypto.symbol}>
                        {crypto.name} ({crypto.symbol})
                        {crypto.details && <span className="ml-2 text-xs text-gray-500">{crypto.details}</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowFreshAddressDialog(true)}>
                      Generate Fresh Address
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {getCryptoDetails(selectedCrypto) && (
                <p className="mt-1 text-xs text-gray-400">
                  {getCryptoDetails(selectedCrypto)}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center p-4 bg-white rounded-lg">
            {depositAddress ? (
              <QRCodeSVG 
                value={depositAddress} 
                size={192} 
                fgColor="#000000"
                bgColor="#FFFFFF"
                level="H"
                includeMargin={true}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-200 rounded-lg">
                <p className="text-gray-600 text-sm text-center">No address available</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <code className="text-sm break-all">{depositAddress || "No address available"}</code>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCopy}
              disabled={!depositAddress}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Address
            </Button>
          </div>

          <p className="text-xs text-red-500 text-center font-medium">
            <AlertTriangle className="h-4 w-4 inline-block mr-1" />
            Warning: Please ensure you send only {selectedCrypto} to this address.
            Funds sent to the wrong address or blockchain will be lost forever.
          </p>

          {previousAddresses.length > 1 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-200 mb-2">Previous Addresses</h3>
              <div className="space-y-2">
                {previousAddresses.slice(1).map((address, index) => (
                  <div 
                    key={index} 
                    className="p-2 rounded-md bg-gradient-to-r from-gray-800/50 to-gray-700/30 text-xs"
                  >
                    <code className="break-all">{address}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-6 w-6 p-0" 
                      onClick={() => navigator.clipboard.writeText(address)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={showFreshAddressDialog} onOpenChange={setShowFreshAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Fresh Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to generate a new {selectedCrypto} address? 
              Additional fees may apply for generating new addresses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFreshAddressDialog(false)}>
              Cancel
            </Button>
            <Button onClick={generateFreshAddress} disabled={isLoading}>
              {isLoading ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Check className="h-4 w-4 mr-2" /> Confirm</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Receive;
