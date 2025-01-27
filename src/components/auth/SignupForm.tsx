import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "../ui/GlassCard";

const SignupForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate signup - replace with actual registration
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account created!",
        description: "Welcome to CoinDuka.",
      });
    }, 1500);
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="First Name"
            className="bg-white/50"
            required
          />
          <Input
            type="text"
            placeholder="Last Name"
            className="bg-white/50"
            required
          />
        </div>
        <Input
          type="email"
          placeholder="Email"
          className="w-full bg-white/50"
          required
        />
        <Input
          type="text"
          placeholder="Country"
          className="w-full bg-white/50"
          required
        />
        <Input
          type="password"
          placeholder="Password"
          className="w-full bg-white/50"
          required
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          className="w-full bg-white/50"
          required
        />
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
    </GlassCard>
  );
};

export default SignupForm;