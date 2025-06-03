import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  QrCode,
  RefreshCw,
  MoreVertical,
  Check,
  AlertTriangle,
  Camera,
} from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { ApiService } from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";
import { cryptoCurrencies } from "@/types/currency";
import { QRCodeSVG } from "qrcode.react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import html2canvas from "html2canvas";
import { useAppSelector } from "@/lib/redux/hooks";

const Receive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState(
    cryptoCurrencies[1].symbol
  );
  const [depositAddress, setDepositAddress] = useState("");
  const [previousAddresses, setPreviousAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  const [showFreshAddressDialog, setShowFreshAddressDialog] = useState(false);
  const receivePageRef = useRef<HTMLDivElement>(null);
  const user = useAppSelector((state: any) => state.auth.user);
  const merchant = useAppSelector((state: any) => state.auth.merchant);
  const userIdentifier =
    user?.email || user?.phone || merchant?.email || merchant?.phone || "";
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

      console.log("Fetching deposit addresses for", currency);

      // Fetch previously generated addresses

      const addresses = await ApiService.getDepositAddresses({
        userIdentifier,
        currency,
        isMerchant,
      });

      console.log("Received addresses:", addresses);

      // If there are previous addresses, use the first one as the current address
      if (addresses && addresses.length > 0) {
        setPreviousAddresses(addresses);
        setDepositAddress(addresses[0]);
      } else {
        console.log("No previous addresses, generating a new one");
        // If no previous addresses, generate a new one
        try {
          const address = await ApiService.generateDepositAddress({
            userIdentifier,
            currency,
            isMerchant,
            fresh: true,
          });

          console.log("Generated address:", address);
          if (address) {
            setDepositAddress(address);
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description:
                "Failed to generate deposit address. Please try again later.",
            });
          }
        } catch (genError) {
          console.error("Error generating address:", genError);
          toast({
            variant: "destructive",
            title: "Error",
            description:
              "Failed to generate deposit address. Please try again later.",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching deposit address:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deposit address. Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setIsFetchingAddresses(false);
    }
  };

  const generateFreshAddress = async () => {
    try {
      setIsLoading(true);

      // console.log("Generating fresh address for", selectedCrypto);

      const address = await ApiService.generateDepositAddress({
        userIdentifier,
        currency: selectedCrypto,
        isMerchant,
        fresh: true,
      });

      // console.log("Fresh address generated:", address);
      setDepositAddress(address);

      // Refresh the list of addresses
      const addresses = await ApiService.getDepositAddresses({
        userIdentifier,
        currency: selectedCrypto,
        isMerchant,
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
        description:
          "Failed to generate a new deposit address. Please try again later.",
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

  const handleScreenshot = async () => {
    if (!receivePageRef.current) return;

    try {
      const canvas = await html2canvas(receivePageRef.current);
      const image = canvas.toDataURL("image/png");

      // Create a temporary anchor element to download the image
      const link = document.createElement("a");
      link.href = image;
      link.download = `${selectedCrypto}-address-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Screenshot captured!",
        description: "Your screenshot has been saved.",
      });
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to capture screenshot.",
      });
    }
  };

  const getCryptoDetails = (symbol: string) => {
    const crypto = cryptoCurrencies.find((c) => c.symbol === symbol);
    return crypto?.details || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-fuchsia-500 to-pink-400 dark:from-purple-900 dark:via-gray-900 dark:to-black p-4 md:p-8">
      <NavigationHeader title="Receive" />

      <div
        ref={receivePageRef}
        className="max-w-md mx-auto glass-effect p-6 rounded-lg space-y-6"
      >
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="space-y-2">
              <Skeleton height="h-4" width="w-40" />
              <Skeleton height="h-10" width="w-full" />
            </div>

            <div className="flex justify-center p-4 bg-white rounded-lg">
              <Skeleton height="h-48" width="w-48" />
            </div>

            <div className="space-y-2">
              <Skeleton height="h-12" width="w-full" />
              <Skeleton height="h-10" width="w-full" />
            </div>

            <Skeleton height="h-10" width="w-full" />
          </div>
        ) : (
          <div className="space-y-6">
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
                          {crypto.symbol === "ETH" && (
                            <div className="ml-2">
                              <div className="text-xs text-gray-500 mt-1">
                                Receive native ERC-20 tokens
                              </div>
                              <div className="flex mt-1 space-x-1">
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">
                                  UT
                                </div>
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">
                                  UC
                                </div>
                                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white">
                                  DAI
                                </div>
                                <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white">
                                  +
                                </div>
                              </div>
                            </div>
                          )}
                          {crypto.details && crypto.symbol !== "ETH" && (
                            <span className="ml-2 text-xs text-gray-500">
                              {crypto.details}
                            </span>
                          )}
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
                      <DropdownMenuItem
                        onClick={() => setShowFreshAddressDialog(true)}
                      >
                        Generate Fresh Address
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {getCryptoDetails(selectedCrypto) &&
                  selectedCrypto !== "ETH" && (
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
                  <p className="text-gray-600 text-sm text-center">
                    No address available
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <code className="text-sm break-all">
                  {depositAddress || "No address available"}
                </code>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCopy}
                  disabled={!depositAddress}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Address
                </Button>
                <Button
                  variant="outline"
                  className="w-auto"
                  onClick={handleScreenshot}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-red-500 text-center font-medium">
              <AlertTriangle className="h-4 w-4 inline-block mr-1" />
              Warning: Please ensure you send only {selectedCrypto} to this
              address. Funds sent to the wrong address or blockchain will be
              lost forever.
            </p>

            {previousAddresses.length > 1 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-200 mb-2">
                  Previous Addresses
                </h3>
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
      </div>

      <Dialog
        open={showFreshAddressDialog}
        onOpenChange={setShowFreshAddressDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Fresh Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to generate a new {selectedCrypto} address?
              Additional fees may apply for generating new addresses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFreshAddressDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={generateFreshAddress} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />{" "}
                  Generating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Receive;
