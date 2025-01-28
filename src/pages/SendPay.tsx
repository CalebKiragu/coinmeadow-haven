import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Phone, CreditCard, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import confetti from 'canvas-confetti';

type Step = 1 | 2 | 3;

const SendPay = () => {
  const [activeTab, setActiveTab] = useState("mobile");
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<"success" | "error" | null>(null);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    } else {
      // Simulate transaction processing
      const success = Math.random() > 0.5;
      setTransactionStatus(success ? "success" : "error");
      if (success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <Input
              type="tel"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
              {/* Mock contacts list */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div>
                    <div className="font-medium">Contact {i + 1}</div>
                    <div className="text-sm text-gray-500">+254 7XX XXX XXX</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderTransactionResult = () => {
    if (!transactionStatus) return null;

    return (
      <div className="text-center space-y-4 animate-scale-in">
        {transactionStatus === "success" ? (
          <>
            <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
            <h3 className="text-2xl font-bold">Transaction Successful!</h3>
            <p className="text-gray-500">Your payment has been processed successfully.</p>
          </>
        ) : (
          <>
            <XCircle className="w-24 h-24 mx-auto text-red-500" />
            <h3 className="text-2xl font-bold">Transaction Failed</h3>
            <p className="text-red-500">Insufficient funds. Please try again with a different amount.</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6 bg-transparent border border-white/10">
            <TabsTrigger
              value="mobile"
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              <Phone className="h-4 w-4" />
              Send to Mobile
            </TabsTrigger>
            <TabsTrigger
              value="merchant"
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              <CreditCard className="h-4 w-4" />
              Pay Merchant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile" className="glass-effect p-6 rounded-lg">
            {transactionStatus ? (
              renderTransactionResult()
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between mb-8">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`flex items-center ${
                        step !== 3 ? "flex-1" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step <= currentStep
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
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

                {renderStep()}

                <Button
                  className="w-full mt-4"
                  onClick={handleNextStep}
                >
                  {currentStep === 3 ? "Complete Transaction" : "Next"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="merchant" className="glass-effect p-6 rounded-lg">
            <div className="text-center text-gray-500">
              Merchant payment feature coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SendPay;