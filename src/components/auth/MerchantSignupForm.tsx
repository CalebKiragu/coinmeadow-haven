
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "../ui/GlassCard";
import ThirdPartyAuth from "./ThirdPartyAuth";
import OTPInput from "./OTPInput";
import SignupFormFields from "./SignupFormFields";

const MerchantSignupForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailStep, setEmailStep] = useState(1);
  const [phoneStep, setPhoneStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [merchantName, setMerchantName] = useState("");
  const [repName, setRepName] = useState("");
  const [repContact, setRepContact] = useState("");
  const navigate = useNavigate();

  const handleNext = async (type: "email" | "phone") => {
    const identifier = type === "email" ? email : phone;
    if (!identifier) {
      toast({
        title: "Error",
        description: `Please enter your ${type} to continue.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      toast({
        title: "OTP Sent!",
        description: `Check your ${type} for the verification code.`,
      });

      if (type === "email") {
        setEmailStep((prev) => prev + 1);
      } else {
        setPhoneStep((prev) => prev + 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (type: "email" | "phone") => {
    const otp = type === "email" ? emailOtp : phoneOtp;
    const identifier = type === "email" ? email : phone;

    setIsLoading(true);
    try {
      if (type === "email") {
        setEmailStep((prev) => prev + 1);
      } else {
        setPhoneStep((prev) => prev + 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName || !repName || !repContact) {
      toast({
        title: "Error",
        description: "Please fill in all merchant details.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      toast({
        title: "Account created!",
        description: "Welcome to CoinDuka Merchant.",
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const renderStepContent = (activeTab: "email" | "phone") => {
    const step = activeTab === "email" ? emailStep : phoneStep;
    const otp = activeTab === "email" ? emailOtp : phoneOtp;
    const setOtp = activeTab === "email" ? setEmailOtp : setPhoneOtp;
    const identifier = activeTab === "email" ? email : phone;

    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            {activeTab === "email" ? (
              <Input
                type="email"
                placeholder="Business Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50"
                required
              />
            ) : (
              <Input
                type="tel"
                placeholder="Business Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/50"
                required
              />
            )}
            <Button
              type="button"
              onClick={() => handleNext(activeTab)}
              className="w-full bg-gradient-to-r from-coffee to-coffee-dark hover:from-coffee-dark hover:to-coffee"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Next"}
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <OTPInput value={otp} onChange={setOtp} identifier={identifier} />
            <Button
              type="button"
              onClick={() => handleVerifyOtp(activeTab)}
              disabled={otp.length !== 4 || isLoading}
              className="w-full bg-gradient-to-r from-coffee to-coffee-dark hover:from-coffee-dark hover:to-coffee"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in space-y-4">
            <Input
              type="text"
              placeholder="Merchant Name"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full bg-white/50"
              required
            />
            <Input
              type="text"
              placeholder="Representative Name"
              value={repName}
              onChange={(e) => setRepName(e.target.value)}
              className="w-full bg-white/50"
              required
            />
            <Input
              type="text"
              placeholder="Representative Contact"
              value={repContact}
              onChange={(e) => setRepContact(e.target.value)}
              className="w-full bg-white/50"
              required
            />
            <SignupFormFields
              country=""
              setCountry={() => {}}
              refId=""
            />
            <Button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-coffee to-coffee-dark hover:from-coffee-dark hover:to-coffee"
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
        <h2 className="text-2xl font-bold">Create Merchant Account</h2>
        <span className="text-sm text-muted-foreground">
          Step {activeTab === "email" ? emailStep : phoneStep} of 3
        </span>
      </div>
      <Tabs
        defaultValue="email"
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "email" | "phone")}
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TabsContent value="email">{renderStepContent("email")}</TabsContent>
          <TabsContent value="phone">{renderStepContent("phone")}</TabsContent>
        </form>
      </Tabs>
      {emailStep === 1 && phoneStep === 1 && <ThirdPartyAuth />}
    </GlassCard>
  );
};

export default MerchantSignupForm;
