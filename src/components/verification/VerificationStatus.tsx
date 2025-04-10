
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { ShieldCheck, ShieldX, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { maskSensitiveData } from "@/lib/utils";
import {
  toggleLoading,
  verificationFailure,
} from "@/lib/redux/slices/authSlice";
import { ApiService } from "@/lib/services";

const VerificationStatus = () => {
  const { verificationStatus, user, merchant, error, isLoading } =
    useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const currentVerificationStatus = useMemo(() => {
    if (!verificationStatus || verificationStatus.length === 0) return null;
    return [...verificationStatus].sort((a, b) => b.timestamp - a.timestamp)[0];
  }, [verificationStatus]);

  // Fetch verification status if not available
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (verificationStatus?.length > 0) return; // Skip fetching if already available

      dispatch(toggleLoading());
      dispatch(verificationFailure(null)); // Update Redux state

      try {
        await ApiService.getVerificationStatus({
          email: user?.email || merchant?.email || "",
          phone: user?.phone || merchant?.phone || "",
        });
      } catch (err) {
        dispatch(
          verificationFailure(
            "Failed to fetch verification status. Please try again."
          )
        ); // Update Redux state
      } finally {
        dispatch(toggleLoading());
      }
    };

    fetchVerificationStatus();

    if (currentVerificationStatus?.status === "APPROVED") {
      confetti({
        particleCount: 250,
        spread: 100,
        origin: { y: 0.6 },
      });
    } else if (currentVerificationStatus?.status === "REJECTED") {
      // Failure animation (red flash effect)
      document.body.classList.add("bg-red-100");
      setTimeout(() => document.body.classList.remove("bg-red-100"), 1000);
    }
  }, [verificationStatus, user, merchant]);

  const handleContactSupport = () => {
    window.open("https://wa.me/+254713278107", "_blank");
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-500">
        <p>Loading verification status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 bg-white shadow-lg rounded-lg">
      <div className="text-center">
        {currentVerificationStatus?.status === "APPROVED" ? (
          <>
            <ShieldCheck className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Verification Successful
            </h2>
            <p className="text-gray-600">
              Your identity has been successfully verified.
            </p>
          </>
        ) : currentVerificationStatus?.status === "REJECTED" ? (
          <>
            <ShieldX className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600">
              Unfortunately, your verification was not approved.
            </p>
          </>
        ) : (
          <>
            <ShieldCheck className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">
              Verification In Progress
            </h2>
            <p className="text-gray-600">
              Your verification request has been submitted and is being
              reviewed. Please Contact Support if this takes too long.
            </p>
          </>
        )}
      </div>

      {/* Verification Details */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Verification Details
        </h3>
        <div className="space-y-1 text-gray-600">
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`font-semibold ${
                currentVerificationStatus?.status === "APPROVED"
                  ? "text-green-600"
                  : currentVerificationStatus?.status === "REJECTED"
                  ? "text-red-600"
                  : "text-yellow-500"
              }`}
            >
              {currentVerificationStatus?.status}
            </span>
          </p>
          <p>
            <span className="font-medium">Submitted:</span>{" "}
            {new Date(
              currentVerificationStatus?.timestamp
            ).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Reference: </span>#
            {currentVerificationStatus?.verifId}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Personal Information
        </h3>
        <div className="space-y-1 text-gray-600">
          <p>
            <span className="font-medium">Full Name:</span>{" "}
            {currentVerificationStatus?.firstName}{" "}
            {currentVerificationStatus?.lastName}
          </p>
          <p>
            <span className="font-medium">Phone:</span>{" "}
            {maskSensitiveData(currentVerificationStatus?.phone)}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {maskSensitiveData(currentVerificationStatus?.email)}
          </p>
          <p>
            <span className="font-medium">Location:</span>{" "}
            {currentVerificationStatus?.location}
          </p>
        </div>
      </div>

      {/* Contact Support */}
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
