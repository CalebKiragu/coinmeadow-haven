import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NavigationHeader = ({ title }: { title: string }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="text-white"
        >
          <Home className="h-6 w-6" />
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <div className="w-12" />
    </div>
  );
};