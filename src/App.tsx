import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import Verification from "@/pages/Verification";
import Portfolio from "@/pages/Portfolio";
import VerificationStatus from "@/components/verification/VerificationStatus";
import { toast } from "sonner";
import { NavigationHeader } from "@/components/shared/NavigationHeader";

export type VerificationStep = "form" | "preview" | "status";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/verification" element={<Verification />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </Router>
  );
}

export default App;
