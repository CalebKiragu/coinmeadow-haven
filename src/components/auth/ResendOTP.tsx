
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ResendOTPProps {
  onResend: () => void;
  cooldownPeriod?: number; // in seconds
}

const ResendOTP = ({ onResend, cooldownPeriod = 60 }: ResendOTPProps) => {
  const [countdown, setCountdown] = useState(cooldownPeriod);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Start countdown on first render
    setCountdown(cooldownPeriod);
    
    let timer: number | undefined;
    
    if (countdown > 0 && !isActive) {
      timer = window.setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            setIsActive(true);
            clearInterval(timer);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownPeriod]);

  const handleResend = () => {
    if (isActive) {
      onResend();
      setIsActive(false);
      setCountdown(cooldownPeriod);
      
      // Start new cooldown timer
      const timer = window.setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            setIsActive(true);
            clearInterval(timer);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  };

  return (
    <div className="flex items-center justify-center mt-4">
      <Button
        variant="link"
        onClick={handleResend}
        disabled={!isActive}
        className="flex items-center gap-1"
      >
        <RefreshCw className="w-3 h-3" />
        Resend OTP {!isActive && countdown > 0 ? `(${countdown}s)` : ""}
      </Button>
    </div>
  );
};

export default ResendOTP;
