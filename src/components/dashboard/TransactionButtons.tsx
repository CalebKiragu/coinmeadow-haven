import { Send, Wallet, CreditCard, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TransactionButtons = () => {
  const navigate = useNavigate();
  
  const buttons = [
    { icon: Send, label: "Send/Pay", color: "from-blue-500 to-blue-600", onClick: () => navigate("/send-pay") },
    { icon: Wallet, label: "Receive", color: "from-green-500 to-green-600" },
    { icon: CreditCard, label: "Deposit", color: "from-purple-500 to-purple-600" },
    { icon: ArrowDownToLine, label: "Withdraw", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {buttons.map(({ icon: Icon, label, color, onClick }) => (
        <Button
          key={label}
          onClick={onClick}
          className={`h-24 flex flex-col items-center justify-center space-y-2 glass-effect hover:scale-105 transition-all duration-300 bg-gradient-to-r ${color} hover:opacity-90`}
        >
          <Icon size={24} />
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default TransactionButtons;