import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import BalanceCard from "@/components/dashboard/BalanceCard";
import TransactionButtons from "@/components/dashboard/TransactionButtons";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import NotificationBell from "@/components/shared/NotificationBell";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
        <div className="w-full max-w-md">
          {showLogin ? <LoginForm /> : <SignupForm />}
          <p className="text-center mt-4 text-white">
            {showLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="text-white underline hover:text-purple-200"
            >
              {showLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">CoinDuka</h1>
          <NotificationBell />
        </div>
        
        <div className="space-y-8">
          <BalanceCard />
          <TransactionButtons />
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
};

export default Index;