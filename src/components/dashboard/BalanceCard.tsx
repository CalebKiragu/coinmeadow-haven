import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const BalanceCard = () => {
  const [showBalance, setShowBalance] = useState(false);

  return (
    <GlassCard className="relative animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Total Balance</h2>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <div className="text-3xl font-bold mb-2">
        {showBalance ? "$12,345.67" : "••••••••"}
      </div>
      <div className="text-sm text-gray-600">
        {showBalance ? "+2.5% today" : "••••"}
      </div>
    </GlassCard>
  );
};

export default BalanceCard;