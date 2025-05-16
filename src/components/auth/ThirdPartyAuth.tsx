import { useToast } from "@/hooks/use-toast";
import { getEnvironmentConfig } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ThirdPartyAuth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = getEnvironmentConfig().googleScriptSrc;
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
      const buttonContainer = document.getElementById("google-signin-button");
      if (buttonContainer) {
        buttonContainer.innerHTML = "";
      }
    };
  }, []);

  // Initialize Google Sign-In button when script is loaded
  useEffect(() => {
    if (googleScriptLoaded && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: getEnvironmentConfig().googleClientId,
          callback: handleGoogleSignIn,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "filled_blue",
            size: "large",
            text: "continue_with",
            width: "100%",
          }
        );
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
      }
    }
  }, [googleScriptLoaded]);

  const handleGoogleSignIn = async (response: any) => {
    try {
      setIsLoading(true);
      // Extract the credential from the response
      const { credential } = response;

      // Here you would send the token to your backend for verification
      // and further processing
      console.log("Google Sign-In successful", credential);

      toast({
        title: "Google authentication successful",
        description: "You are logged in.",
      });

      // For now, we'll just navigate to the dashboard
      // In a real application, you'd verify this token with your backend
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast({
        title: "Google Sign-In Failed",
        description: "Could not authenticate with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        <div id="google-signin-button" className="w-full "></div>
      </div>
    </div>
  );
};

export default ThirdPartyAuth;
