
import { useState, useEffect } from "react";
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
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  const { isAuthenticated, error, otp } = useAppSelector((state) => state.auth);

  // Load Google Identity Services script
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleScriptLoaded(true);
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();

    return () => {
      // Cleanup any Google sign-in instances
      const buttonContainer = document.getElementById('merchant-google-signin-button');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
      }
    };
  }, []);

  // Initialize Google Sign-In button when script is loaded
  useEffect(() => {
    if (googleScriptLoaded && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: '339887597881-dtj402e9975k4r8stoejgovj1me8gicn.apps.googleusercontent.com',
          callback: handleGoogleSignIn
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById('merchant-google-signin-button'),
          { 
            theme: 'filled_blue', 
            size: 'large',
            text: 'continue_with',
            width: '100%'
          }
        );
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    }
  }, [googleScriptLoaded]);

  const handleGoogleSignIn = async (response: any) => {
    try {
      setIsLoading(true);
      // Extract the credential from the response
      const { credential } = response;
      
      // Here you would send the token to your backend for verification
      // and further processing
      console.log("Google Sign-In successful for merchant", credential);
      
      toast({
        title: "Google authentication successful",
        description: "Logging you in as merchant...",
      });
      
      // For now, we'll just navigate to the dashboard
      // In a real application, you'd verify this token with your backend
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast({
        title: "Google Sign-In Failed",
        description: "Could not authenticate with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleBaseSignin = () => {
    toast({
      title: "Base authentication",
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
          <div id="merchant-google-signin-button" className="w-full"></div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleBaseSignin}
            className="bg-[#0052FF] hover:bg-[#0039B3] text-white"
          >
            Continue with Base
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
