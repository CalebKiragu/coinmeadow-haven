import { Send, Wallet, CreditCard, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionButtonsProps {
  isLoading?: boolean;
}

const TransactionButtons = ({ isLoading = false }: TransactionButtonsProps) => {
  const navigate = useNavigate();

  const buttons = [
    {
      icon: Send,
      label: "Send/Pay",
      color: "from-blue-500 to-blue-600",
      onClick: () => navigate("/send"),
    },
    {
      icon: Wallet,
      label: "Receive",
      color: "from-green-500 to-green-600",
      onClick: () => navigate("/receive"),
    },
    {
      icon: CreditCard,
      label: "Deposit",
      color: "from-purple-500 to-purple-600",
      onClick: () => navigate("/deposit"),
    },
    {
      icon: ArrowDownToLine,
      label: "Withdraw",
      color: "from-orange-500 to-orange-600",
      onClick: () => navigate("/withdraw"),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height="h-20" className="rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {buttons.map(({ icon: Icon, label, color, onClick }) => (
        <Button
          key={label}
          onClick={onClick}
          className={`h-20 flex flex-col items-center justify-center space-y-2 glass-effect hover:scale-105 transition-all duration-300 bg-gradient-to-r ${color} hover:opacity-90`}
        >
          <Icon size={20} />
          <span className="text-sm">{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default TransactionButtons;
