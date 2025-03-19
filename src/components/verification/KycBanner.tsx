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
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="text-sm font-medium">
            Your account verification is incomplete. Verify your identity to access all features.
          </AlertDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="text-white border-white hover:bg-red-800 hover:text-white"
        >
          <Shield className="mr-2 h-4 w-4" />
          Verify Now
        </Button>
      </div>
    </Alert>
  );
};

export default KycBanner;
