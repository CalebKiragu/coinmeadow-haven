import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login - replace with actual authentication
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    }, 1500);
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email or Phone"
            className="w-full bg-white/50"
            required
          />
        </div>
        <div className="space-y-2 relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full bg-white/50 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
        <div className="text-center text-sm">
          <a href="#" className="text-purple-600 hover:text-purple-700">
            Forgot password?
          </a>
        </div>
      </form>
    </GlassCard>
  );
};

export default LoginForm;