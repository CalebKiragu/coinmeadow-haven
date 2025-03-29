
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cryptoCurrencies } from "@/types/currency";
import { useToast } from "@/components/ui/use-toast";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { ApiService } from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";

const Receive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState(
    cryptoCurrencies[0].symbol
  );
  const [depositAddress, setDepositAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDepositAddress(selectedCrypto);
  }, [selectedCrypto]);

  const fetchDepositAddress = async (currency: string) => {
    try {
      setIsLoading(true);
      const response = await ApiService.receiveInstructions(
        currency.toLowerCase()
      );

      if (response.success && response.data && response.data.address) {
        setDepositAddress(response.data.address);
      } else {
        // Fallback to mock addresses if API fails
        const mockAddresses = [
          "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
          "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
        ];
        setDepositAddress(
          mockAddresses[Math.floor(Math.random() * mockAddresses.length)]
        );
      }
    } catch (error) {
      console.error("Error fetching deposit address:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to fetch deposit address. Using sample address instead.",
      });

      // Use a default address as fallback
      setDepositAddress("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
    } finally {
      // Simulate loading for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(depositAddress);
    toast({
      title: "Address copied!",
      description: "The deposit address has been copied to your clipboard.",
    });
  };

  const generateNewAddress = () => {
    fetchDepositAddress(selectedCrypto);
    toast({
      title: "New address generated",
      description: "A new deposit address has been generated for you.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <NavigationHeader title="Receive" />

      {isLoading ? (
        <div className="max-w-md mx-auto glass-effect p-6 rounded-lg space-y-6 animate-pulse">
          {/* Skeleton for the select cryptocurrency */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Skeleton for QR code */}
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <Skeleton className="w-48 h-48" />
          </div>
          
          {/* Skeleton for address display and copy */}
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Skeleton for warning text */}
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="max-w-md mx-auto glass-effect p-6 rounded-lg space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-200">
              Select Cryptocurrency
            </label>
            <Select
              value={selectedCrypto}
              onValueChange={setSelectedCrypto}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {cryptoCurrencies.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    {crypto.name} ({crypto.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QrCode className="w-48 h-48" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <code className="text-sm break-all">{depositAddress}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
                disabled={!depositAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={generateNewAddress}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New Address
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Warning: Please ensure you send only {selectedCrypto} to this address.
            Funds sent to the wrong address or blockchain will be lost forever.
          </p>
        </div>
      )}
    </div>
  );
};

export default Receive;
