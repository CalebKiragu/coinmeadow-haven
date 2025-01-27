import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "../ui/GlassCard";

const SignupForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate("/dashboard");
    }, 1500);
  };

  const handleThirdPartySignup = (provider: string) => {
    toast({
      title: `${provider} sign up`,
      description: "This feature is coming soon!",
    });
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
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
          <TabsContent value="email">
            <Input
              type="email"
              placeholder="Email"
              className="w-full bg-white/50"
              required
            />
          </TabsContent>
          <TabsContent value="phone">
            <Input
              type="tel"
              placeholder="Phone (e.g., +254700000000)"
              className="w-full bg-white/50"
              required
            />
          </TabsContent>
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
      </Tabs>
      <div className="mt-4 space-y-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleThirdPartySignup("Google")}
            className="bg-white/50"
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleThirdPartySignup("Twitter")}
            className="bg-white/50"
          >
            Twitter
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default SignupForm;