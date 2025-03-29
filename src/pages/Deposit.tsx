import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { useToast } from "@/components/ui/use-toast";
import { RootState } from "@/lib/redux/store";
import { ApiService } from "@/lib/services";
import { cryptoCurrencies, fiatCurrencies, countries } from "@/types/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TransactionSummary } from "@/components/send/TransactionSummary";
import { StepIndicator } from "@/components/send/StepIndicator";

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payerInfo, setPayerInfo] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionStatus, setTransactionStatus] = useState<
    "success" | "error" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);
  const [selectedCountryCode, setSelectedCountryCode] = useState("254"); // Kenya by default

  // Currency handling
  const [selectedCryptoCurrency, setSelectedCryptoCurrency] = useState("BTC");
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState("USD");
  const [isCryptoAmount, setIsCryptoAmount] = useState(false); // Default to fiat
  const [rates, setRates] = useState<{[key: string]: number}>({});
  
  const [isValid, setIsValid] = useState(false);
  const phoneRegex = /^\d{1,10}$/;
  
  // Validate recipient input (phone only now)
  useEffect(() => {
    setIsValid(phoneRegex.test(payerInfo.replace(/[^\d]/g, '')));
  }, [payerInfo]);
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 10 characters
    const value = e.target.value.replace(/[^\d]/g, '');
    setPayerInfo(value.substring(0, 10));
  };

  const handleNextStep = async () => {
    if (currentStep < 3) {
      if ((currentStep === 1 && !isValid) || 
          (currentStep === 2 && !amount)) {
        toast({
          variant: "destructive",
          title: "Required Field",
          description: "Please fill in all required fields correctly to continue",
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
      // Process deposit
      await processDeposit();
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

  const processDeposit = async () => {
    try {
      setIsProcessing(true);

      const initiator = auth.user?.phone || auth.merchant?.phone || "";
      const firstName = auth.user?.firstName || auth.merchant?.repName || "";
      const lastName = auth.user?.lastName || auth.merchant?.merchantName || "";

      const formattedPayerInfo = payerInfoType === 'phone' 
        ? `+${selectedCountryCode}${payerInfo}` 
        : payerInfo;

      const payload = {
        type: "deposit",
        initiator,
        sender: formattedPayerInfo,
        recipient: initiator,
        senderFirstName: "External",
        senderLastName: "Source",
        recipientFirstName: firstName,
        recipientLastName: lastName,
        amount: isCryptoAmount ? amount : convertFiatToCrypto(amount, selectedCryptoCurrency, selectedFiatCurrency),
        pin,
        inOut: `${selectedCryptoCurrency}-${selectedCryptoCurrency}`,
        currency: selectedCryptoCurrency.toLowerCase(),
        txType: "DEPOSIT" as const,
      };

      const response = await ApiService.deposit(payload);

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
          title: "Deposit Failed",
          description:
            response.error || "There was an error processing your deposit.",
        });
      }
    } catch (error) {
      console.error("Deposit error:", error);
      setTransactionStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <NavigationHeader title="Deposit" />

      <div className="max-w-md mx-auto glass-effect p-6 rounded-lg">
        {!transactionStatus ? (
          <div className="space-y-6">
            <StepIndicator
              steps={3}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />

            {currentStep > 1 && (
              <TransactionSummary
                type="mobile"
                step={currentStep}
                recipient={payerInfo}
                amount={isCryptoAmount ? amount : convertFiatToCrypto(amount, selectedCryptoCurrency, selectedFiatCurrency)}
                currency={selectedCryptoCurrency}
                fiatAmount={currentStep === 3 ? 
                  !isCryptoAmount ? amount : convertCryptoToFiat(amount, selectedCryptoCurrency, selectedFiatCurrency) 
                  : undefined}
                fiatCurrency={selectedFiatCurrency}
                rate={currentStep === 3 ? rates[`${selectedCryptoCurrency}-${selectedFiatCurrency}`]?.toFixed(2) || "0.00" : undefined}
              />
            )}

            {currentStep === 1 ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex gap-2">
                  <Select
                    value={selectedCountryCode}
                    onValueChange={setSelectedCountryCode}
                  >
                    <SelectTrigger className="w-[90px] flex-shrink-0">
                      <SelectValue placeholder="+254" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => {
                        // Get the country code based on country code
                        let countryCode = "";
                        switch(country.code) {
                          case 'KE': countryCode = '254'; break;
                          case 'NG': countryCode = '234'; break;
                          case 'UG': countryCode = '256'; break;
                          case 'TZ': countryCode = '255'; break;
                          case 'US': countryCode = '1'; break;
                          default: return null; // Skip duplicate values
                        }
                        return (
                          <SelectItem 
                            key={country.code} 
                            value={countryCode}
                          >
                            +{countryCode}
                          </SelectItem>
                        );
                      }).filter(Boolean)}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={payerInfo}
                    onChange={handleInputChange}
                    className={`flex-grow ${!isValid && payerInfo ? 'border-red-500' : ''}`}
                    maxLength={10}
                    required
                  />
                </div>
                {!isValid && payerInfo && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid phone number</p>
                )}
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
                  ? "Complete Deposit"
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
                <h3 className="text-2xl font-bold">Deposit Successful!</h3>
                <p className="text-gray-500">
                  Your deposit has been processed successfully.
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-24 h-24 mx-auto text-red-500" />
                <h3 className="text-2xl font-bold">Deposit Failed</h3>
                <p className="text-red-500">
                  Unable to process deposit. Please try again.
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

export default Deposit;
