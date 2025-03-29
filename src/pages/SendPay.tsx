import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { StepIndicator } from "@/components/send/StepIndicator";
import { MerchantPayment } from "@/components/send/MerchantPayment";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { useToast } from "@/components/ui/use-toast";
import { RootState } from "@/lib/redux/store";
import { MobileTransfer } from "@/components/send/MobileTransfer";
import { SendPayProvider, useSendPay } from "@/contexts/SendPayContext";
import { TransactionSummary } from "@/components/send/TransactionSummary";
import { ApiService } from "@/lib/services";

const SendPayContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("mobile");
  const [mobileStep, setMobileStep] = useState(1);
  const [merchantStep, setMerchantStep] = useState(1);
  const [transactionStatus, setTransactionStatus] = useState<
    "success" | "error" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);

  const {
    mobileNumber,
    mobileAmount,
    mobilePin,
    merchantNumber,
    merchantAmount,
    merchantPin,
  } = useSendPay();

  // Reset step when tab changes
  useEffect(() => {
    if (activeTab === "mobile") {
      setMobileStep(1);
    } else {
      setMerchantStep(1);
    }
  }, [activeTab]);

  const currentStep = activeTab === "mobile" ? mobileStep : merchantStep;

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      if (activeTab === "mobile") {
        setMobileStep(step);
      } else {
        setMerchantStep(step);
      }
    }
  };

  const handleNextStep = async () => {
    if (activeTab === "mobile") {
      if (mobileStep < 3) {
        setMobileStep((prev) => prev + 1);
      } else {
        await processTransaction();
      }
    } else {
      if (merchantStep < 3) {
        setMerchantStep((prev) => prev + 1);
      } else {
        await processTransaction();
      }
    }
  };

  const handleBackStep = () => {
    if (activeTab === "mobile" && mobileStep > 1) {
      setMobileStep((prev) => prev - 1);
    } else if (activeTab === "merchant" && merchantStep > 1) {
      setMerchantStep((prev) => prev - 1);
    }
  };

  const processTransaction = async () => {
    try {
      setIsProcessing(true);

      const sender = auth.user?.phone || auth.merchant?.phone || "";
      const senderFirstName =
        auth.user?.firstName || auth.merchant?.repName || "";
      const senderLastName =
        auth.user?.lastName || auth.merchant?.merchantName || "";

      let payload;

      if (activeTab === "mobile") {
        payload = {
          type: "internal",
          initiator: sender,
          sender: sender,
          recipient: mobileNumber,
          senderFirstName,
          senderLastName,
          recipientFirstName: "John", // Default recipient name
          recipientLastName: "Doe",
          amount: mobileAmount,
          pin: mobilePin,
          inOut: "BTC-BTC", // Default transfer type
          currency: "btc", // Default currency
          txType: "USERSEND",
        };
      } else {
        payload = {
          type: "internal",
          initiator: sender,
          sender: sender,
          recipient: merchantNumber,
          senderFirstName,
          senderLastName,
          recipientFirstName: "Holdings", // Default merchant name
          recipientLastName: "Co.",
          amount: merchantAmount,
          pin: merchantPin,
          inOut: "BTC-BTC", // Default transfer type
          currency: "btc", // Default currency
          txType: "MERCHANTPAY",
        };
      }

      const response = await ApiService.transferFunds(payload);

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
          title: "Transaction Failed",
          description:
            response.error || "There was an error processing your transaction.",
        });
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

                {currentStep > 1 && (
                  <TransactionSummary
                    type={activeTab}
                    step={currentStep}
                    recipient={
                      activeTab === "mobile" ? mobileNumber : merchantNumber
                    }
                    amount={
                      activeTab === "mobile" ? mobileAmount : merchantAmount
                    }
                  />
                )}

                {activeTab === "mobile" ? (
                  <MobileTransfer currentStep={mobileStep} />
                ) : (
                  <MerchantPayment currentStep={merchantStep} />
                )}

                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={handleNextStep}
                    disabled={
                      isProcessing ||
                      (activeTab === "mobile" &&
                        ((mobileStep === 1 && !mobileNumber) ||
                          (mobileStep === 2 && !mobileAmount) ||
                          (mobileStep === 3 && !mobilePin))) ||
                      (activeTab === "merchant" &&
                        ((merchantStep === 1 && !merchantNumber) ||
                          (merchantStep === 2 && !merchantAmount) ||
                          (merchantStep === 3 && !merchantPin)))
                    }
                  >
                    {isProcessing
                      ? "Processing..."
                      : currentStep === 3
                      ? "Complete Transaction"
                      : "Next"}
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

const SendPay = () => {
  return (
    <SendPayProvider>
      <SendPayContent />
    </SendPayProvider>
  );
};

export default SendPay;
