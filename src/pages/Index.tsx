
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import MerchantLoginForm from "@/components/auth/MerchantLoginForm";
import MerchantSignupForm from "@/components/auth/MerchantSignupForm";
import { useAppSelector } from "@/lib/redux/hooks";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

const Index = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [isMerchant, setIsMerchant] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }

    // Load Google Identity Services script
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
      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
      }
    };
  }, [isAuthenticated, navigate]);

  // Initialize Google Sign-In button when script is loaded
  useEffect(() => {
    if (googleScriptLoaded && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: '339887597881-dtj402e9975k4r8stoejgovj1me8gicn.apps.googleusercontent.com',
          callback: handleGoogleSignIn
        });
        
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          window.google.accounts.id.renderButton(
            buttonContainer,
            { 
              theme: 'filled_blue', 
              size: 'large',
              text: 'continue_with',
              width: '100%'
            }
          );
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    }
  }, [googleScriptLoaded, showLogin, isMerchant]);

  const handleGoogleSignIn = (response: any) => {
    console.log("Google Sign-In successful", response);
    // Here you would send the token to your backend for verification
    // For demo purposes, just navigate to dashboard
    navigate("/dashboard", { replace: true });
  };

  const handleBaseSignin = () => {
    console.log("Base authentication clicked");
    // Implement Base authentication here
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-coffee-light via-coffee to-dollar-dark">
      <div className="w-full max-w-md">
        <div className="mb-6">
          {showLogin ? (
            isMerchant ? (
              <MerchantLoginForm />
            ) : (
              <LoginForm />
            )
          ) : (
            isMerchant ? (
              <MerchantSignupForm />
            ) : (
              <SignupForm />
            )
          )}
          
          <div className="relative my-6">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-coffee px-3 text-white/70">
              OR
            </span>
          </div>

          <div className="space-y-4">
            <div id="google-signin-button" className="w-full"></div>
            
            <Button
              type="button"
              onClick={handleBaseSignin}
              className="w-full bg-[#0052FF] hover:bg-[#0039B3] text-white"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Continue with Base
            </Button>
          </div>
        </div>
        
        <p className="text-center mt-4 text-white">
          {showLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="text-white underline hover:text-coffee-light"
          >
            {showLogin
              ? isMerchant
                ? "Sign up as Merchant"
                : "Sign up"
              : "Login"}
          </button>
        </p>
        {showLogin && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-white">
              {isMerchant ? "Not a business?" : "Are you a business?"}
            </span>
            <button
              onClick={() => setIsMerchant(!isMerchant)}
              className="text-white underline hover:text-coffee-light"
            >
              {isMerchant ? "User Login" : "Merchant Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Extend Window interface to include google property
declare global {
  interface Window {
    google?: any;
  }
}

export default Index;
