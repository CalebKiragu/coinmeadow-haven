import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";

const Withdraw = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionStatus, setTransactionStatus] = useState<
    "success" | "error" | null
  >(null);

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Simulate transaction processing
      const success = Math.random() > 0.5;
      setTransactionStatus(success ? "success" : "error");
      if (success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
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
        <h1 className="text-2xl font-bold text-white">Withdraw</h1>
        <div className="w-12" /> {/* Spacer for alignment */}
      </div>

      <div className="max-w-md mx-auto glass-effect p-6 rounded-lg">
        {!transactionStatus ? (
          <div className="space-y-6">
            <div className="flex justify-between mb-8">
              {[1, 2].map((step) => (
                <div
                  key={step}
                  className={`flex items-center ${step !== 2 ? "flex-1" : ""}`}
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
                  {step !== 2 && (
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

            <Button className="w-full" onClick={handleNextStep}>
              {currentStep === 2 ? "Complete Withdrawal" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;