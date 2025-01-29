import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Copy,
  QrCode,
  RefreshCw,
} from "lucide-react";
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

const Receive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoCurrencies[0].symbol);
  const [depositAddress, setDepositAddress] = useState("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(depositAddress);
    toast({
      title: "Address copied!",
      description: "The deposit address has been copied to your clipboard.",
    });
  };

  const generateNewAddress = () => {
    // Simulate generating a new address
    const mockAddresses = [
      "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
      "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    ];
    setDepositAddress(
      mockAddresses[Math.floor(Math.random() * mockAddresses.length)]
    );
    toast({
      title: "New address generated",
      description: "A new deposit address has been generated for you.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white"
          >
            <Home className="h-6 w-6" />
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-white">Receive</h1>
        <div className="w-12" /> {/* Spacer for alignment */}
      </div>

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
    </div>
  );
};

export default Receive;