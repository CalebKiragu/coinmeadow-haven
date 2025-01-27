import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "../ui/GlassCard";
import SignupFormFields from "./SignupFormFields";
import ThirdPartyAuth from "./ThirdPartyAuth";

const SignupForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account created!",
        description: "Welcome to CoinDuka.",
      });
      navigate("/dashboard");
    }, 1500);
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
          <SignupFormFields country={country} setCountry={setCountry} />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </Tabs>
      <ThirdPartyAuth />
    </GlassCard>
  );
};

export default SignupForm;