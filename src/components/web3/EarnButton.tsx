
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

interface EarnButtonProps {
  className?: string;
  onClick?: () => void;
}

const EarnButton = ({ className = "", onClick }: EarnButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={className}
    >
      <TrendingUp className="h-3 w-3 mr-1" />
      Stake to Earn
    </Button>
  );
};

export default EarnButton;
