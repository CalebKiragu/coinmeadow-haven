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
        <Button
          type="button"
          variant="outline"
          onClick={() => handleThirdPartySignup("Google")}
          className="bg-[#4285F4] hover:bg-[#357ABD] text-white border-none"
        >
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleThirdPartySignup("Twitter")}
          className="bg-[#1DA1F2] hover:bg-[#1A8CD8] text-white border-none"
        >
          Continue with Twitter
        </Button>
      </div>
    </div>
  );
};

export default ThirdPartyAuth;