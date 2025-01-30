import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  // skip login if already authenticated
  if (isAuthenticated) {
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900">
      <div className="w-full max-w-md">
        {showLogin ? <LoginForm /> : <SignupForm />}
        <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
          {showLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700 dark:hover:text-purple-300"
          >
            {showLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Index;