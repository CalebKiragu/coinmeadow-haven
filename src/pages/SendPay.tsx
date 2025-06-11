import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { TransferResponse } from "@/lib/services/transactionService";
import { BlockchainTransfer } from "@/components/send/BlockchainTransfer";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import AnimatedCheckmark from "@/components/ui/animated-checkmark";
import { triggerPrompt } from "@/lib/redux/slices/web3Slice";
import ConfirmPromptDialog from "@/components/web3/ConfirmPrompt";

const SendPayContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("mobile");
  const [mobileStep, setMobileStep] = useState(1);
  const [merchantStep, setMerchantStep] = useState(1);
  const [blockchainStep, setBlockchainStep] = useState(1);
  const [transactionStatus, setTransactionStatus] = useState<
    "success" | "error" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const auth = useAppSelector((state: any) => state.auth);
  const promptObj = useAppSelector((state) => state.web3.prompt);
  const [confirmPromptOpen, setConfirmPromptOpen] = useState(false);

  const {
    mobileNumber,
    mobileAmount,
    mobilePin,
    mobileInputType,
    merchantNumber,
    merchantAmount,
    merchantPin,
    blockchainMode,
    blockchainAddress,
    blockchainAmount,
    blockchainPin,
    selectedCryptoCurrency,
    selectedFiatCurrency,
    selectedCountryCode,
    convertCryptoToFiat,
    rates,
    resetMobileFlow,
    resetMerchantFlow,
    resetBlockchainFlow,
  } = useSendPay();

  useEffect(() => {
    if (promptObj) {
      setConfirmPromptOpen(promptObj.openDialog);
    } else {
      setConfirmPromptOpen(!confirmPromptOpen);
    }
  }, [promptObj]);

  // Reset step when tab changes
  useEffect(() => {
    if (activeTab === "mobile") {
      setMerchantStep(1); // Reset merchant step
      resetMerchantFlow();
    } else {
      setMobileStep(1); // Reset mobile step
      resetMobileFlow();
    }

    // Reset blockchain mode when switching tabs
    if (blockchainMode) {
      resetBlockchainFlow();
    }
  }, [activeTab]);

  const currentStep = blockchainMode
    ? blockchainStep
    : activeTab === "mobile"
    ? mobileStep
    : merchantStep;

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      if (blockchainMode) {
        setBlockchainStep(step);
      } else if (activeTab === "mobile") {
        setMobileStep(step);
      } else {
        setMerchantStep(step);
      }
    }
  };

  const handleNextStep = async () => {
    if (blockchainMode) {
      if (blockchainStep < 3) {
        setBlockchainStep((prev) => prev + 1);
      } else {
        await processTransaction();
      }
    } else if (activeTab === "mobile") {
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
    if (blockchainMode) {
      if (blockchainStep > 1) {
        setBlockchainStep((prev) => prev - 1);
      } else {
        resetBlockchainFlow();
      }
    } else if (activeTab === "mobile" && mobileStep > 1) {
      setMobileStep((prev) => prev - 1);
    } else if (activeTab === "merchant" && merchantStep > 1) {
      setMerchantStep((prev) => prev - 1);
    }
  };

  const isButtonDisabled = () => {
    if (isProcessing) return true;

    if (blockchainMode) {
      if (blockchainStep === 1 && !blockchainAddress) return true;
      if (blockchainStep === 2 && !blockchainAmount) return true;
      if (blockchainStep === 3 && (!blockchainPin || blockchainPin.length < 4))
        return true;
    } else if (activeTab === "mobile") {
      if (mobileStep === 1 && !mobileNumber) return true;
      if (mobileStep === 2 && !mobileAmount) return true;
      if (mobileStep === 3 && (!mobilePin || mobilePin.length < 4)) return true;
    } else {
      if (merchantStep === 1 && !merchantNumber) return true;
      if (merchantStep === 2 && !merchantAmount) return true;
      if (merchantStep === 3 && (!merchantPin || merchantPin.length < 4))
        return true;
    }

    return false;
  };

  const processTransaction = async () => {
    try {
      setIsProcessing(true);

      console.log("AUTH >>> ", auth);

      const sender =
        auth.user?.phone ||
        auth.user?.email ||
        auth.merchant?.phone ||
        auth.merchant?.email ||
        "";
      const senderFirstName =
        auth.user?.firstName || auth.merchant?.repName || "";
      const senderLastName =
        auth.user?.lastName || auth.merchant?.merchantName || "";

      let payload;
      if (blockchainMode) {
        payload = {
          type: "external",
          initiator: sender,
          sender: sender,
          recipient: blockchainAddress,
          senderFirstName,
          senderLastName,
          recipientFirstName: "External",
          recipientLastName: "Wallet",
          amount: blockchainAmount,
          pin: blockchainPin,
          inOut: `${selectedCryptoCurrency}-${selectedCryptoCurrency}`,
          currency: selectedCryptoCurrency.toLowerCase(),
          txType: "BCWITHDRAW",
        };
      } else if (activeTab === "mobile") {
        payload = {
          type: "internal",
          initiator: sender,
          sender: sender,
          recipient:
            mobileInputType === "phone"
              ? `${selectedCountryCode}${mobileNumber}`
              : mobileNumber,
          senderFirstName,
          senderLastName,
          recipientFirstName: "John", // Default recipient name
          recipientLastName: "Doe",
          amount: mobileAmount,
          pin: mobilePin,
          inOut: `${selectedCryptoCurrency}-${selectedCryptoCurrency}`,
          currency: selectedCryptoCurrency.toLowerCase(),
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
          inOut: `${selectedCryptoCurrency}-${selectedCryptoCurrency}`,
          currency: selectedCryptoCurrency.toLowerCase(),
          txType: "MERCHANTPAY",
        };
      }

      const response: TransferResponse = await ApiService.transferFunds(
        payload
      );

      if (response.success || response.msg === "Transaction successful") {
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
    <div className="min-h-screen max-w-full overflow-x-hidden bg-gradient-to-br from-purple-800 via-fuchsia-500 to-pink-400 dark:from-purple-900 dark:via-gray-900 dark:to-black p-4 md:p-8">
      <NavigationHeader
        title={blockchainMode ? "Send to Blockchain" : "Send/Pay"}
      />

      <div className="max-w-2xl mx-auto">
        {!blockchainMode ? (
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

            <div className="glass-effect p-4 sm:p-6 rounded-lg">
              {!transactionStatus ? (
                <div className="space-y-4 sm:space-y-6">
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
                        activeTab === "mobile"
                          ? selectedCountryCode + mobileNumber
                          : merchantNumber
                      }
                      amount={
                        activeTab === "mobile" ? mobileAmount : merchantAmount
                      }
                      currency={selectedCryptoCurrency}
                      fiatAmount={
                        currentStep === 3
                          ? convertCryptoToFiat(
                              activeTab === "mobile"
                                ? mobileAmount
                                : merchantAmount,
                              selectedCryptoCurrency,
                              selectedFiatCurrency
                            )
                          : undefined
                      }
                      fiatCurrency={selectedFiatCurrency}
                      rate={
                        currentStep === 3
                          ? rates[
                              `${selectedCryptoCurrency}-${selectedFiatCurrency}`
                            ]?.toFixed(2) || "0.00"
                          : undefined
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
                      disabled={isButtonDisabled()}
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
        ) : (
          <div className="glass-effect p-4 sm:p-6 rounded-lg">
            {!transactionStatus ? (
              <div className="space-y-4 sm:space-y-6">
                <StepIndicator
                  steps={3}
                  currentStep={blockchainStep}
                  onStepClick={handleStepClick}
                />

                {blockchainStep > 1 && (
                  <TransactionSummary
                    type="blockchain"
                    step={blockchainStep}
                    recipient={blockchainAddress}
                    amount={blockchainAmount}
                    currency={selectedCryptoCurrency}
                    fiatAmount={
                      blockchainStep === 3
                        ? convertCryptoToFiat(
                            blockchainAmount,
                            selectedCryptoCurrency,
                            selectedFiatCurrency
                          )
                        : undefined
                    }
                    fiatCurrency={selectedFiatCurrency}
                    rate={
                      blockchainStep === 3
                        ? rates[
                            `${selectedCryptoCurrency}-${selectedFiatCurrency}`
                          ]?.toFixed(2) || "0.00"
                        : undefined
                    }
                  />
                )}

                <BlockchainTransfer currentStep={blockchainStep} />

                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={handleNextStep}
                    disabled={isButtonDisabled()}
                  >
                    {isProcessing
                      ? "Processing..."
                      : blockchainStep === 3
                      ? "Complete Transaction"
                      : "Next"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleBackStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {blockchainStep === 1 ? "Cancel" : "Back"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 animate-scale-in">
                {transactionStatus === "success" ? (
                  <>
                    {/* <CheckCircle className="w-24 h-24 mx-auto text-green-500" /> */}
                    <AnimatedCheckmark />
                    <h3 className="text-2xl font-bold text-green-600">
                      Transaction Successful!
                    </h3>
                    <p className="text-gray-500">
                      Your blockchain transfer has been processed successfully.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-24 h-24 mx-auto text-red-500" />
                    <h3 className="text-2xl font-bold">Transaction Failed</h3>
                    <p className="text-red-500">
                      Unable to process blockchain transfer. Please try again.
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
        )}
      </div>

      {/* Confirm prompt dialog */}
      <ConfirmPromptDialog
        open={confirmPromptOpen}
        onOpenChange={setConfirmPromptOpen}
      />
    </div>
  );
};

const SendPay = () => {
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const amount = parseFloat(params.get("amount") || "");
    const currency = params.get("currency");
    const to = params.get("to");

    console.log("PARAMS >> ", params, amount, currency, to);

    if (amount && currency && to) {
      dispatch(
        triggerPrompt({
          prompt: {
            openDialog: true,
            prompt: { type: "send", amount, currency, recipient: to },
          },
        })
      );
    }
  }, [params]);

  return (
    <SendPayProvider>
      <SendPayContent />
    </SendPayProvider>
  );
};

export default SendPay;
