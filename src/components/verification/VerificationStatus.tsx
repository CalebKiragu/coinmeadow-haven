import { useEffect } from "react";
import confetti from "canvas-confetti";
import { ShieldCheck, ShieldX, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";

const VerificationStatus = () => {
  useEffect(() => {
    // Trigger confetti animation on successful verification
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handleContactSupport = () => {
    window.open("https://wa.me/YOUR_WHATSAPP_NUMBER", "_blank");
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <ShieldCheck className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Verification In Progress</h2>
        <p className="text-muted-foreground">
          Your verification request has been submitted successfully and is being reviewed.
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Verification Details</h3>
        <div className="space-y-2">
          <p>Status: <span className="font-semibold text-yellow-500">IN PROGRESS</span></p>
          <p>Submitted: {new Date().toLocaleDateString()}</p>
          <p>Reference: #VER-{Math.random().toString(36).substr(2, 9)}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Verification History</h3>
        <div className="space-y-2">
          <p>No previous verification attempts</p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Account Status</h3>
        <div className="space-y-2">
          <p>No active restrictions or suspensions</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={handleContactSupport}
          className="flex items-center gap-2"
        >
          <Headset className="h-4 w-4" />
          Need Help? Contact Support
        </Button>
      </div>
    </div>
  );
};

export default VerificationStatus;