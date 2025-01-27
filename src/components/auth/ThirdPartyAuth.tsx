import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ThirdPartyAuth = () => {
  const { toast } = useToast();

  const handleThirdPartySignup = (provider: string) => {
    toast({
      title: `${provider} sign up`,
      description: "This feature is coming soon!",
    });
  };

  return (
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
  );
};

export default ThirdPartyAuth;