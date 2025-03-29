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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { NavigationHeader } from "@/components/shared/NavigationHeader";
import { useToast } from "@/components/ui/use-toast";
import { RootState } from "@/lib/redux/store";
import { ApiService } from "@/lib/services";

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

  const handleNextStep = async () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Process withdrawal
      await processWithdrawal();
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
        amount,
        pin,
        inOut: "BTC-BTC", // Default transfer type
        currency: "btc", // Default currency
        txType: "WITHDRAW" as const,
      };

      const response = await ApiService.withdraw(payload);

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
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step <= currentStep
                        ? "bg-primary text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
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

            {currentStep === 1 ? (
              <div className="space-y-4 animate-fade-in">
                <Input
                  type="text"
                  placeholder="Enter Receiver's Address/Phone"
                  value={receiverInfo}
                  onChange={(e) => setReceiverInfo(e.target.value)}
                />
              </div>
            ) : currentStep === 2 ? (
              <div className="space-y-4 animate-fade-in">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
            )}

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
