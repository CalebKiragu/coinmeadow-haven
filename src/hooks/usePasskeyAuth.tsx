
import { useState, useEffect, useRef } from "react";
import { useToast } from "./use-toast";

export const usePasskeyAuth = () => {
  const [isPasskeyVerified, setIsPasskeyVerified] = useState(false);
  const [lastVerifiedTime, setLastVerifiedTime] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  // Check if passkey is still valid (verified within the last 3 minutes)
  useEffect(() => {
    if (lastVerifiedTime) {
      const currentTime = Date.now();
      const timeElapsed = currentTime - lastVerifiedTime;
      const threeMinutesInMs = 3 * 60 * 1000;

      if (timeElapsed > threeMinutesInMs) {
        setIsPasskeyVerified(false);
      }
    }
  }, [lastVerifiedTime]);

  // Mock implementation for the passkey verification
  // In a real app, this would use the Web Authentication API
  const verifyPasskey = async (): Promise<boolean> => {
    // Prevent multiple simultaneous verification attempts
    if (isVerifying) {
      return isPasskeyVerified;
    }

    // If already verified and within time limit, return true without showing toast
    if (isPasskeyVerified && lastVerifiedTime) {
      const currentTime = Date.now();
      const timeElapsed = currentTime - lastVerifiedTime;
      const threeMinutesInMs = 3 * 60 * 1000;

      if (timeElapsed <= threeMinutesInMs) {
        return true;
      }
    }

    return new Promise((resolve, reject) => {
      setIsVerifying(true);

      // Simulate passkey authentication with biometrics where supported
      try {
        // Check if Web Authentication API is available
        if (window.PublicKeyCredential) {
          // In a real implementation, this would check if biometrics are available
          const hasBiometrics = 'credentials' in navigator && 
                               typeof navigator.credentials.get === 'function';
          
          // Simulate successful verification
          setTimeout(() => {
            setIsPasskeyVerified(true);
            setLastVerifiedTime(Date.now());
            setIsVerifying(false);
            
            // No success toast - removed per requirements
            resolve(true);
          }, 1000);
        } else {
          // Fallback for browsers that don't support WebAuthn
          const confirmation = window.confirm(
            "Passkey not supported in this browser. Authenticate with PIN instead?"
          );

          if (confirmation) {
            // Simulate successful verification
            setTimeout(() => {
              setIsPasskeyVerified(true);
              setLastVerifiedTime(Date.now());
              setIsVerifying(false);
              
              // No success toast - removed per requirements
              resolve(true);
            }, 1000);
          } else {
            setIsVerifying(false);
            reject(new Error("Authentication cancelled"));
          }
        }
      } catch (error) {
        setIsVerifying(false);
        toast({
          title: "Authentication Error",
          description: "There was a problem verifying your identity",
          variant: "destructive",
        });

        reject(error);
      }
    });
  };

  return {
    isPasskeyVerified,
    verifyPasskey,
    isVerifying,
  };
};
