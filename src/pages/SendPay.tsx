
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Home,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import confetti from "canvas-confetti";
import { StepIndicator } from "@/components/send/StepIndicator";
import { MerchantPayment } from "@/components/send/MerchantPayment";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { useToast } from "@/components/ui/use-toast";
import { TransactionService } from "@/lib/services/transactionService";
import { RootState } from "@/lib/redux/store";

const SendPay = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("mobile");
  const [currentStep, setCurrentStep] = useState(1);
  const [savedData, setSavedData] = useState<any>({});
  const [transactionStatus, setTransactionStatus] = useState<
    "success" | "error" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleNextStep = async () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Process transaction
      await processTransaction();
    }
  };

  const processTransaction = async () => {
    try {
      setIsProcessing(true);
      
      const sender = auth.user?.phone || auth.merchant?.phone || "";
      const senderFirstName = auth.user?.firstName || auth.merchant?.repName || "";
      const senderLastName = auth.user?.lastName || auth.merchant?.merchantName || "";
      
      let payload;
      
      if (activeTab === "mobile") {
        payload = {
          type: "internal",
          initiator: sender,
          sender: sender,
          recipient: savedData.phoneNumber,
          senderFirstName,
          senderLastName,
          recipientFirstName: "", // We don't have this info for mobile transfers
          recipientLastName: "",
          amount: savedData.amount,
          pin: savedData.pin,
          inOut: "BTC-BTC", // Default transfer type
          currency: "btc", // Default currency
          txType: "USERSEND"
        };
      } else {
        payload = {
          type: "internal",
          initiator: sender,
          sender: sender,
          recipient: savedData.merchantNumber,
          senderFirstName,
          senderLastName,
          recipientFirstName: "Merchant", // Default merchant name
          recipientLastName: "Account",
          amount: savedData.amount,
          pin: savedData.pin,
          inOut: "BTC-BTC", // Default transfer type
          currency: "btc", // Default currency
          txType: "MERCHANTPAY"
        };
      }
      
      const response = await TransactionService.transferFunds(payload);
      
      if (response.success) {
        setTransactionStatus("success");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setTransactionStatus("error");
      }
    } catch (error) {
      console.error("Transaction error:", error);
      setTransactionStatus("error");
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "There was an error processing your transaction.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataChange = (data: any) => {
    setSavedData((prev: any) => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <NavigationHeader title={"Send/Pay"} />

      <div className="max-w-2xl mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <TabsList className="w-full bg-transparent border border-white/10">
            <TabsTrigger
              value="mobile"
              className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              Send to Mobile
            </TabsTrigger>
            <TabsTrigger
              value="merchant"
              className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              Pay Merchant
            </TabsTrigger>
          </TabsList>

          <div className="glass-effect p-6 rounded-lg">
            {!transactionStatus ? (
              <div className="space-y-6">
                <StepIndicator
                  steps={3}
                  currentStep={currentStep}
                  onStepClick={handleStepClick}
                />

                {activeTab === "mobile" ? (
                  <>
                    {currentStep === 1 && (
                      <div className="space-y-4 animate-fade-in">
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
                          value={savedData.phoneNumber || ""}
                          onChange={(e) =>
                            handleDataChange({ phoneNumber: e.target.value })
                          }
                        />
                        <div className="relative">
                          <Input
                            type="search"
                            placeholder="Search contacts"
                            className="pl-10"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        </div>
                        <div className="h-64 overflow-y-auto glass-effect p-4 rounded-lg">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                {String.fromCharCode(65 + i)}
                              </div>
                              <div>
                                <div className="font-medium">
                                  Contact {i + 1}
                                </div>
                                <div className="text-sm text-gray-500">
                                  +254 7XX XXX XXX
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div className="space-y-4 animate-fade-in">
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={savedData.amount || ""}
                          onChange={(e) =>
                            handleDataChange({ amount: e.target.value })
                          }
                        />
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div className="space-y-4 animate-fade-in">
                        <Input
                          type="password"
                          placeholder="Enter PIN"
                          value={savedData.pin || ""}
                          onChange={(e) =>
                            handleDataChange({ pin: e.target.value })
                          }
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <MerchantPayment
                    onNextStep={handleNextStep}
                    currentStep={currentStep}
                    savedData={savedData}
                    onDataChange={handleDataChange}
                  />
                )}

                <Button 
                  className="w-full" 
                  onClick={handleNextStep}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : currentStep === 3 ? "Complete Transaction" : "Next"}
                  {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4 animate-scale-in">
                {transactionStatus === "success" ? (
                  <>
                    <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
                    <h3 className="text-2xl font-bold">
                      Transaction Successful!
                    </h3>
                    <p className="text-gray-500">
                      Your payment has been processed successfully.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-24 h-24 mx-auto text-red-500" />
                    <h3 className="text-2xl font-bold">Transaction Failed</h3>
                    <p className="text-red-500">
                      Unable to process transaction. Please try again.
                    </p>
                  </>
                )}
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/dashboard")}
                >
                  Return to Dashboard
                </Button>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SendPay;
