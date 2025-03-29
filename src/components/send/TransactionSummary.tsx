
import { Badge } from "@/components/ui/badge";

export const TransactionSummary = ({
  type,
  step,
  recipient,
  amount,
  loading = false,
  currency = "BTC",
  fiatAmount,
  fiatCurrency = "USD",
  rate,
}: {
  type: string;
  step: number;
  recipient: string;
  amount: string;
  loading?: boolean;
  currency?: string;
  fiatAmount?: string;
  fiatCurrency?: string;
  rate?: string;
}) => {
  const actionText = type === "mobile" ? "Sending to" : 
                     type === "blockchain" ? "Sending to address" : "Paying merchant";
  
  if (loading) {
    return (
      <div className="bg-black/20 p-3 rounded-lg border border-white/10 text-center">
        <p>Loading transaction details...</p>
      </div>
    );
  }

  return (
    <div className="bg-black/20 p-3 rounded-lg border border-white/10">
      {step === 2 && (
        <div className="flex flex-col items-center space-y-2">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            {actionText}
          </span>
          <span className="font-bold text-xl">
            <Badge variant="outline" className="text-lg px-3 py-1 bg-black/30">
              {recipient}
            </Badge>
          </span>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center space-y-3">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            {actionText}
          </span>
          <span className="font-bold text-xl">
            <Badge variant="outline" className="text-lg px-3 py-1 bg-black/30">
              {recipient}
            </Badge>
          </span>
          <div className="flex flex-col items-center">
            <span className="font-bold text-2xl text-white">
              {amount} <span className="text-sm font-normal text-gray-300">{currency}</span>
            </span>
            {fiatAmount && (
              <span className="text-sm text-emerald-400">
                ≈ {fiatAmount} {fiatCurrency}
              </span>
            )}
            {rate && (
              <span className="text-xs text-blue-300 mt-2">
                Rate: 1 {currency} = {rate} {fiatCurrency}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
