import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/lib/redux/hooks";
import { loginSuccess } from "@/lib/redux/slices/authSlice";
import { AuthService } from "@/lib/services";

interface BaseAuthProps {
  onComplete?: (user: any) => void;
  isSignUp?: boolean;
}

// Using the global declaration instead of redefining it
// The window.phantom type is already defined in global.d.ts

const BaseAuth: React.FC<BaseAuthProps> = ({ 
  onComplete,
  isSignUp = false
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleBaseAuth = async () => {
    setIsConnecting(true);
    
    try {
      // Generate a challenge message for signing
      const { challenge } = await AuthService.getWalletChallenge();
      
      // Connect wallet and request signature
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts.length) {
          const address = accounts[0];
          
          // Request signature
          const provider = new (window as any).ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const signature = await signer.signMessage(challenge);
          
          // Verify signature with backend
          const { user, token, isNewUser } = await AuthService.verifyWalletSignature({
            address,
            signature,
            challenge,
          });
          
          if (isNewUser && isSignUp) {
            // Need to collect more user info
            setNeedsProfile(true);
          } else {
            // Login successful
            handleAuthSuccess(user, token);
          }
        }
      } else {
        toast({
          title: "Wallet not available",
          description: "Please install MetaMask or Coinbase Wallet",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Base authentication error:", error);
      toast({
        title: "Authentication failed",
        description: (error as Error)?.message || "Could not authenticate with wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !firstName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      const { user, token } = await AuthService.completeWalletSignup({
        email,
        firstName,
        lastName
      });
      
      handleAuthSuccess(user, token);
    } catch (error) {
      console.error("Error completing profile:", error);
      toast({
        title: "Profile update failed",
        description: (error as Error)?.message || "Could not save profile information",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleAuthSuccess = (user: any, token: any) => {
    dispatch(loginSuccess({ user, token }));
    
    toast({
      title: "Authentication successful",
      description: "You have been logged in",
    });
    
    if (onComplete) {
      onComplete(user);
    } else {
      navigate("/dashboard");
    }
  };

  if (needsProfile) {
    return (
      <div className="p-4 bg-white/5 backdrop-blur-lg rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-center">Complete Your Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white/10 border-white/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white/10 border-white/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white/10 border-white/20"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#0052FF] hover:bg-[#0039B3]"
            disabled={isConnecting}
          >
            {isConnecting ? "Saving..." : "Complete Signup"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleBaseAuth} 
      className="w-full bg-[#0052FF] hover:bg-[#0039B3] text-white"
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting..." : "Continue with Base"}
    </Button>
  );
};

export default BaseAuth;
