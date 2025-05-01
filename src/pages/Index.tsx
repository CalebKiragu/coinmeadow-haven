
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import MerchantLoginForm from "@/components/auth/MerchantLoginForm";
import MerchantSignupForm from "@/components/auth/MerchantSignupForm";
import BaseAuth from "@/components/auth/BaseAuth";
import { useAppSelector } from "@/lib/redux/hooks";
import { Separator } from "@/components/ui/separator";
import { Wallet } from "lucide-react";

const Index = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [isMerchant, setIsMerchant] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-coffee-light via-coffee to-dollar-dark">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <BaseAuth isSignUp={!showLogin} />
          
          <div className="relative my-6">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-coffee px-3 text-white/70">
              OR
            </span>
          </div>
        </div>
        
        {isMerchant ? (
          showLogin ? (
            <MerchantLoginForm />
          ) : (
            <MerchantSignupForm />
          )
        ) : showLogin ? (
          <LoginForm />
        ) : (
          <SignupForm />
        )}
        
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

export default Index;
