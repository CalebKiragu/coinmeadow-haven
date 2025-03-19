
import { useNavigate } from "react-router-dom";
import { Shield, AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const KycBanner = () => {
  const navigate = useNavigate();
  const { user, merchant, verificationStatus } = useAppSelector((state) => state.auth);
  
  // Determine if KYC verification is needed
  const needsVerification = () => {
    // If kyc object exists, no verification needed
    if ((user && user.kyc) || (merchant && merchant.kyc)) {
      return false;
    }
    
    // If verification status is APPROVED, no banner needed
    if (verificationStatus && verificationStatus.length > 0) {
      const latestStatus = verificationStatus[0];
      if (latestStatus.status === "APPROVED") {
        return false;
      }
    }
    
    // Otherwise, verification is needed
    return true;
  };
  
  // If verification is not needed, don't render anything
  if (!needsVerification()) {
    return null;
  }
  
  const handleVerificationClick = () => {
    navigate("/verification");
  };
  
  return (
    <Alert 
      variant="destructive" 
      className="mb-6 cursor-pointer bg-red-900/80 text-white border-red-700"
      onClick={handleVerificationClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0 text-amber-300" />
          <AlertDescription className="text-sm md:text-base font-medium">
            Your account verification is incomplete. Verify your identity to access all features.
          </AlertDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="text-white border-white bg-red-800/50 hover:bg-red-700 hover:text-white transition-colors duration-300"
        >
          <Shield className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Verify Now</span>
          <span className="sm:hidden">Verify</span>
        </Button>
      </div>
    </Alert>
  );
};

export default KycBanner;
