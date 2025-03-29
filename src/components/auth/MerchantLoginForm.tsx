import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "../ui/GlassCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChangePinForm from "./ChangePinForm";
import OTPInput from "./OTPInput";
import { useAppSelector } from "@/lib/redux/hooks";
import { ApiService } from "@/lib/services";

const MerchantLoginForm = () => {
  const [showPin, setShowPin] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPinReset, setShowPinReset] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpCaptured, setOtpCaptured] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

  const { isAuthenticated, error, otp } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const credentials = {
        ...(activeTab === "email" ? { email } : { phone }),
        pin,
      };
      await ApiService.loginMerchant(credentials);
      setShowOTP(true);
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (otpCaptured.length === 4) {
      setIsLoading(true);
      try {
        const credentials = {
          ...(activeTab === "email" ? { email } : { phone }),
          pin,
          otp: otp.otp,
          otpId: otp.otpId,
        };
        await ApiService.loginMerchant(credentials);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate("/dashboard", { replace: true });
      } catch (error) {
        toast({
          title: "OTP Verification Failed",
          description: error instanceof Error ? error.message : "Invalid OTP",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  };

  const handleSkipOTP = () => {
    toast({
      title: "Welcome back!",
      description: "You have successfully logged in as a merchant.",
    });
    navigate("/dashboard", { replace: true });
  };

  const handleThirdPartyLogin = (provider: string) => {
    toast({
      title: `${provider} merchant login`,
      description: "This feature is coming soon!",
    });
  };

  if (showOTP) {
    return (
      <GlassCard className="w-full max-w-md mx-auto animate-fade-in">
        <h2 className="text-2xl font-bold text-center mb-6">
          Two-Factor Authentication
        </h2>
        <div className="space-y-4">
          <OTPInput value={otpCaptured} onChange={setOtpCaptured} />
          <Button
            onClick={handleOTPSubmit}
            className="w-full bg-gradient-to-r from-coffee to-coffee-dark hover:from-coffee-dark hover:to-coffee"
            disabled={otpCaptured.length !== 4 || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkipOTP}
            className="w-full text-sm"
          >
            Skip for now
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6">Merchant Login</h2>
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
          <TabsContent value="email">
            <Input
              type="email"
              placeholder="Business Email"
              className="w-full bg-white/50"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="phone">
            <Input
              type="tel"
              placeholder="Business Phone"
              className="w-full bg-white/50"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </TabsContent>
          <div className="space-y-2 relative">
            <Input
              type={showPin ? "text" : "password"}
              placeholder="4-digit PIN"
              maxLength={4}
              pattern="\d{4}"
              className="w-full bg-white/50 pr-10"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-coffee to-coffee-dark hover:from-coffee-dark hover:to-coffee"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Tabs>
      <div className="mt-2 space-y-2">
        <div className="relative mb-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleThirdPartyLogin("Twitter")}
            className="bg-[#1DA1F2] text-white hover:bg-[#1a8cd8]"
          >
            Continue with Twitter
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleThirdPartyLogin("Google")}
            className="bg-[#4285F4] text-white hover:bg-[#3367D6]"
          >
            Continue with Google
          </Button>
        </div>
      </div>
      <div className="text-center text-sm mt-4">
        <button
          onClick={() => setShowPinReset(true)}
          className="text-coffee hover:text-coffee-dark"
        >
          Forgot PIN?
        </button>
      </div>

      <Dialog open={showPinReset} onOpenChange={setShowPinReset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Merchant PIN</DialogTitle>
          </DialogHeader>
          <ChangePinForm
            isReset
            isMerchant
            onClose={() => setShowPinReset(false)}
          />
        </DialogContent>
      </Dialog>
    </GlassCard>
  );
};

export default MerchantLoginForm;
