
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useSendPay } from "@/contexts/SendPayContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cryptoCurrencies } from "@/types/currency";
import { TransactionService } from "@/lib/services/transactionService";
import { useAppSelector } from "@/lib/redux/hooks";

export const BlockchainTransfer = ({
  currentStep,
}: {
  currentStep: number;
}) => {
  const { 
    blockchainAddress,
    setBlockchainAddress,
    blockchainAmount,
    setBlockchainAmount,
    blockchainPin,
    setBlockchainPin,
    selectedCryptoCurrency,
    setSelectedCryptoCurrency,
    convertCryptoToFiat,
    selectedFiatCurrency,
    rates,
    setIsLoading,
    setIsSuccess,
    setError
  } = useSendPay();
  
  const { toast } = useToast();
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const auth = useAppSelector(state => state.auth);
  const userPhone = auth.user?.phone || "";
  const userFirstName = auth.user?.firstName || "";
  const userLastName = auth.user?.lastName || "";
  
  // Basic validation for blockchain address
  useEffect(() => {
    // This is a very basic validation - in a real app, this would be more sophisticated
    setIsAddressValid(blockchainAddress.length > 25);
  }, [blockchainAddress]);
  
  // Function to handle blockchain transfer
  const handleBlockchainTransfer = async () => {
    if (!blockchainAddress || !blockchainAmount || !blockchainPin || !selectedCryptoCurrency) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!isAddressValid) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid blockchain address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setIsLoading(true);
    
    try {
      const response = await TransactionService.sendBlockchain({
        txType: "BCWITHDRAW",
        initiator: userPhone,
        senderFirstName: userFirstName,
        senderLastName: userLastName,
        recipientFirstName: "Recipient", // Default values since we don't collect these
        recipientLastName: "User",
        inOut: `${selectedCryptoCurrency}-${selectedCryptoCurrency}`,
        phone: userPhone,
        pin: blockchainPin,
        recipient: blockchainAddress,
        amount: blockchainAmount,
        currency: selectedCryptoCurrency.toLowerCase()
      });
      
      if (response.success) {
        setIsSuccess(true);
        toast({
          title: "Transfer Initiated",
          description: "Your blockchain withdrawal has been submitted successfully",
        });
      } else {
        setError(response.error || "Transaction failed");
        toast({
          title: "Transaction Failed",
          description: response.error || "There was an error processing your transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Blockchain transfer error:", error);
      let errorMessage = "An unexpected error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };
  
  // Submit on the final step
  useEffect(() => {
    if (currentStep === 3 && blockchainPin.length === 4) {
      handleBlockchainTransfer();
    }
  }, [currentStep, blockchainPin]);
  
  if (currentStep === 1) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Input
          type="text"
          placeholder="Enter blockchain address"
          value={blockchainAddress}
          onChange={(e) => setBlockchainAddress(e.target.value)}
          className={`${!isAddressValid && blockchainAddress ? 'border-red-500' : ''}`}
          required
        />
        {!isAddressValid && blockchainAddress && (
          <p className="text-xs text-red-500 mt-1">Please enter a valid blockchain address</p>
        )}
      </div>
    );
  }
  
  if (currentStep === 2) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder={`Enter amount in ${selectedCryptoCurrency}`}
            value={blockchainAmount}
            onChange={(e) => setBlockchainAmount(e.target.value)}
            required
            className="flex-grow"
          />
          
          <Select
            value={selectedCryptoCurrency}
            onValueChange={setSelectedCryptoCurrency}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cryptoCurrencies.map((crypto) => (
                <SelectItem key={crypto.symbol} value={crypto.symbol}>
                  {crypto.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {blockchainAmount && (
          <div className="text-sm bg-white/10 p-3 rounded-lg">
            <p className="text-emerald-400">
              ≈ {convertCryptoToFiat(blockchainAmount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedFiatCurrency}
              <span className="block text-xs text-blue-300 mt-1">
                1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || '0.00'} {selectedFiatCurrency}
              </span>
            </p>
          </div>
        )}
      </div>
    );
  }
  
  if (currentStep === 3) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Input
          type="password"
          placeholder="Enter PIN"
          value={blockchainPin}
          onChange={(e) => setBlockchainPin(e.target.value)}
          maxLength={4}
          required
          disabled={isSubmitting}
        />
        {isSubmitting && (
          <div className="text-center">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">Processing your transaction...</p>
          </div>
        )}
      </div>
    );
  }

  return null;
};
