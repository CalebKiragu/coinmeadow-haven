import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import GlassCard from "../ui/GlassCard";
import SignupFormFields from "./SignupFormFields";
import ThirdPartyAuth from "./ThirdPartyAuth";
import OTPInput from "./OTPInput";

const SignupForm = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [emailStep, setEmailStep] = useState(1);
  const [phoneStep, setPhoneStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const navigate = useNavigate();
  const refId = searchParams.get("refId") || "";

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
      // await axios.post("/api/auth/send-otp", {
      //   type,
      //   identifier,
      //   refId,
      // });

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
      // await axios.post("/api/auth/verify-otp", {
      //   type,
      //   identifier,
      //   otp,
      //   refId,
      // });

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
    setIsLoading(true);
    try {
      // await axios.post("/api/auth/signup", {
      //   email,
      //   phone,
      //   country,
      //   refId,
      // });

      toast({
        title: "Account created!",
        description: "Welcome to CoinDuka.",
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
          <div className="animate-fade-in">
            <SignupFormFields
              country={country}
              setCountry={setCountry}
              refId={refId}
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
        <h2 className="text-2xl font-bold">Create Account</h2>
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

export default SignupForm;
