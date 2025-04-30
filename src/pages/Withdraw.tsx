
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { useToast } from "@/components/ui/use-toast";
import { RootState } from "@/lib/redux/store";
import { ApiService } from "@/lib/services";
import { TransferResponse } from "@/lib/services/transactionService";
import { cryptoCurrencies, fiatCurrencies } from "@/types/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Withdraw = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [receiverInfo, setReceiverInfo] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionStatus, setTransactionStatus] = useState<
    "success" | "error" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);

  // Currency handling
  const [selectedCryptoCurrency, setSelectedCryptoCurrency] = useState("BTC");
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState("USD");
  const [isCryptoAmount, setIsCryptoAmount] = useState(false); // Default to fiat
  const [rates, setRates] = useState<{[key: string]: number}>({});
  
  useEffect(() => {
    // Simulate fetching exchange rates
    const fetchRates = () => {
      const newRates: {[key: string]: number} = {};
      
      // Generate rates for all crypto-fiat pairs
      cryptoCurrencies.forEach(crypto => {
        fiatCurrencies.forEach(fiat => {
          let baseRate = 0;
          switch (crypto.symbol) {
            case "BTC": baseRate = 65000; break;
            case "ETH": baseRate = 3500; break;
            case "USDT": baseRate = 1; break;
            case "USDC": baseRate = 1; break;
            case "LTC": baseRate = 85; break;
            case "BASE": baseRate = 0.95; break;
            default: baseRate = 1;
          }
          
          // Adjust for different fiat currencies
          let multiplier = 1;
          switch (fiat.code) {
            case "EUR": multiplier = 0.92; break;
            case "GBP": multiplier = 0.78; break;
            case "NGN": multiplier = 1500; break;
            case "KES": multiplier = 130; break;
            case "ZAR": multiplier = 18.5; break;
            case "UGX": multiplier = 3800; break;
            case "TSH": multiplier = 2600; break;
            case "RWF": multiplier = 1250; break;
            case "ETB": multiplier = 56; break;
            default: multiplier = 1;
          }
          
          const key = `${crypto.symbol}-${fiat.code}`;
          newRates[key] = baseRate * multiplier;
        });
      });
      
      setRates(newRates);
    };
    
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const convertCryptoToFiat = (cryptoAmount: string, cryptoCurrency: string, fiatCurrency: string): string => {
    const amount = parseFloat(cryptoAmount) || 0;
    const rate = rates[`${cryptoCurrency}-${fiatCurrency}`] || 0;
    return (amount * rate).toFixed(2);
  };
  
  const convertFiatToCrypto = (fiatAmount: string, cryptoCurrency: string, fiatCurrency: string): string => {
    const amount = parseFloat(fiatAmount) || 0;
    const rate = rates[`${cryptoCurrency}-${fiatCurrency}`] || 1;
    return (amount / rate).toFixed(8);
  };

  const handleNextStep = async () => {
    if (currentStep < 3) {
      if ((currentStep === 1 && !receiverInfo) || 
          (currentStep === 2 && !amount)) {
        toast({
          variant: "destructive",
          title: "Required Field",
          description: "Please fill in all required fields to continue",
        });
        return;
      }
      setCurrentStep((prev) => prev + 1);
    } else {
      if (!pin || pin.length < 4) {
        toast({
          variant: "destructive",
          title: "Invalid PIN",
          description: "Please enter a valid PIN (at least 4 digits)",
        });
        return;
      }
      // Process withdrawal
      await processWithdrawal();
    }
  };
  
  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  
  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const processWithdrawal = async () => {
    try {
      setIsProcessing(true);

      const initiator = auth.user?.phone || auth.merchant?.phone || "";
      const firstName = auth.user?.firstName || auth.merchant?.repName || "";
      const lastName = auth.user?.lastName || auth.merchant?.merchantName || "";

      const payload = {
        type: "withdraw",
        initiator,
        sender: initiator,
        recipient: receiverInfo,
        senderFirstName: firstName,
        senderLastName: lastName,
        recipientFirstName: "External",
        recipientLastName: "Destination",
        amount: isCryptoAmount ? amount : convertFiatToCrypto(amount, selectedCryptoCurrency, selectedFiatCurrency),
        pin,
        inOut: `${selectedCryptoCurrency}-${selectedCryptoCurrency}`,
        currency: selectedCryptoCurrency.toLowerCase(),
        txType: "WITHDRAW" as const,
      };

      const response: TransferResponse = await ApiService.withdraw(payload);

      if (response.success) {
        setTransactionStatus("success");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setTransactionStatus("error");
        toast({
          variant: "destructive",
          title: "Withdrawal Failed",
          description:
            response.error || "There was an error processing your withdrawal.",
        });
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      setTransactionStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <NavigationHeader title="Withdraw" />

      <div className="max-w-md mx-auto glass-effect p-6 rounded-lg">
        {!transactionStatus ? (
          <div className="space-y-6">
            <div className="flex justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex items-center ${step !== 3 ? "flex-1" : ""}`}
                  onClick={() => handleStepClick(step)}
                >
                  <button 
                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                      step <= currentStep
                        ? "bg-primary text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                    disabled={step > currentStep}
                  >
                    {step}
                  </button>
                  {step !== 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step < currentStep ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {currentStep > 1 && (
              <div className="bg-black/20 p-3 rounded-lg border border-white/10">
                {currentStep === 2 && (
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-xs uppercase tracking-wider text-gray-400">
                      Withdrawing to
                    </span>
                    <span className="font-bold text-xl">
                      <Badge variant="outline" className="text-lg px-3 py-1 bg-black/30">
                        {receiverInfo}
                      </Badge>
                    </span>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="flex flex-col items-center space-y-3">
                    <span className="text-xs uppercase tracking-wider text-gray-400">
                      Withdrawing to
                    </span>
                    <span className="font-bold text-xl">
                      <Badge variant="outline" className="text-lg px-3 py-1 bg-black/30">
                        {receiverInfo}
                      </Badge>
                    </span>
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-2xl text-white">
                        {isCryptoAmount ? amount : convertFiatToCrypto(amount, selectedCryptoCurrency, selectedFiatCurrency)} 
                        <span className="text-sm font-normal text-gray-300">{selectedCryptoCurrency}</span>
                      </span>
                      {!isCryptoAmount ? (
                        <span className="text-sm text-emerald-400">
                          ≈ {amount} {selectedFiatCurrency}
                        </span>
                      ) : (
                        <span className="text-sm text-emerald-400">
                          ≈ {convertCryptoToFiat(amount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedFiatCurrency}
                        </span>
                      )}
                      <span className="text-xs text-blue-300 mt-2">
                        Rate: 1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || "0.00"} {selectedFiatCurrency}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 1 ? (
              <div className="space-y-4 animate-fade-in">
                <Input
                  type="text"
                  placeholder="Enter Receiver's Address/Phone"
                  value={receiverInfo}
                  onChange={(e) => setReceiverInfo(e.target.value)}
                  required
                />
              </div>
            ) : currentStep === 2 ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex gap-2 items-center">
                  <Select
                    value={isCryptoAmount ? "crypto" : "fiat"}
                    onValueChange={(value) => setIsCryptoAmount(value === "crypto")}
                    defaultValue="fiat"
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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
                
                {amount && (
                  <div className="text-sm bg-white/10 p-3 rounded-lg">
                    {isCryptoAmount ? (
                      <p className="text-emerald-400">
                        ≈ {convertCryptoToFiat(amount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedFiatCurrency}
                        <span className="block text-xs text-blue-300 mt-1">
                          1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || '0.00'} {selectedFiatCurrency}
                        </span>
                      </p>
                    ) : (
                      <p className="text-emerald-400">
                        ≈ {convertFiatToCrypto(amount, selectedCryptoCurrency, selectedFiatCurrency)} {selectedCryptoCurrency}
                        <span className="block text-xs text-blue-300 mt-1">
                          1 {selectedCryptoCurrency} = {rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || '0.00'} {selectedFiatCurrency}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={handleNextStep}
                disabled={isProcessing}
              >
                {isProcessing
                  ? "Processing..."
                  : currentStep === 3
                  ? "Complete Withdrawal"
                  : "Next"}
                {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBackStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 animate-scale-in">
            {transactionStatus === "success" ? (
              <>
                <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
                <h3 className="text-2xl font-bold">Withdrawal Successful!</h3>
                <p className="text-gray-500">
                  Your withdrawal has been processed successfully.
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-24 h-24 mx-auto text-red-500" />
                <h3 className="text-2xl font-bold">Withdrawal Failed</h3>
                <p className="text-red-500">
                  Unable to process withdrawal. Please try again.
                </p>
              </>
            )}
            <Button className="w-full" onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;
