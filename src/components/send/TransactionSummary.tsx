
import { Badge } from "@/components/ui/badge";

export const TransactionSummary = ({
  type,
  step,
  recipient,
  amount
}: {
  type: string;
  step: number;
  recipient: string;
  amount: string;
}) => {
  const actionText = type === "mobile" ? "Sending to" : "Paying merchant";
  
  return (
    <div className="bg-black/20 p-4 rounded-lg border border-white/10 text-center">
      {step === 2 && (
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm text-gray-400">Transaction Summary</span>
          <span className="font-medium">
            {actionText} <Badge variant="outline">{recipient}</Badge>
          </span>
        </div>
      )}
      
      {step === 3 && (
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm text-gray-400">Transaction Summary</span>
          <span className="font-medium">
            {actionText} <Badge variant="outline">{recipient}</Badge>
          </span>
          <span className="font-bold text-xl">
            {amount} <span className="text-sm font-normal">BTC</span>
          </span>
        </div>
      )}
    </div>
  );
};
