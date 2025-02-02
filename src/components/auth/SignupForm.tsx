import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "../ui/GlassCard";
import SignupFormFields from "./SignupFormFields";
import ThirdPartyAuth from "./ThirdPartyAuth";
import OTPInput from "./OTPInput";

const SignupForm = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const refId = searchParams.get("refId") || "";

  const handleNext = () => {
    if (step === 1) {
      // Simulate OTP sending
      toast({
        title: "OTP Sent!",
        description: `Check your ${email ? "email" : "phone"} for the verification code.`,
      });
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account created!",
        description: "Welcome to CoinDuka.",
      });
      navigate("/dashboard", { replace: true });
    }, 1500);
  };

  const renderStepContent = (activeTab: "email" | "phone") => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            {activeTab === "email" ? (
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50"
                required
              />
            ) : (
              <Input
                type="tel"
                placeholder="Phone (e.g., +254700000000)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/50"
                required
              />
            )}
            <Button
              type="button"
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            >
              Next
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <OTPInput
              value={otp}
              onChange={setOtp}
            />
            <Button
              type="button"
              onClick={handleNext}
              disabled={otp.length !== 4}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            >
              Verify
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <SignupFormFields
              country={country}
              setCountry={setCountry}
              refId={refId}
            />
            <Button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Complete"}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Create Account</h2>
        <span className="text-sm text-muted-foreground">Step {step} of 3</span>
      </div>
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TabsContent value="email">
            {renderStepContent("email")}
          </TabsContent>
          <TabsContent value="phone">
            {renderStepContent("phone")}
          </TabsContent>
        </form>
      </Tabs>
      {step === 1 && <ThirdPartyAuth />}
    </GlassCard>
  );
};

export default SignupForm;