
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  const actionText = type === "mobile" ? "Sending to" : "Paying merchant";
  
  if (loading) {
    return (
      <div className="bg-black/20 p-3 rounded-lg border border-white/10 text-center">
        <div className="flex flex-col items-center space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-7 w-1/2" />
          {step === 3 && <Skeleton className="h-4 w-2/3" />}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 p-3 rounded-lg border border-white/10">
      {step === 2 && (
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm text-gray-300 uppercase tracking-wider">
            {actionText}
          </span>
          <span className="font-bold text-xl">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {recipient}
            </Badge>
          </span>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center space-y-3">
          <span className="text-sm text-gray-300 uppercase tracking-wider">
            {actionText}
          </span>
          <span className="font-bold text-xl">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {recipient}
            </Badge>
          </span>
          <div className="flex flex-col items-center">
            <span className="font-bold text-2xl">
              {amount} <span className="text-sm font-normal">{currency}</span>
            </span>
            {fiatAmount && (
              <span className="text-sm text-gray-300">
                ≈ {fiatAmount} {fiatCurrency}
              </span>
            )}
            {rate && (
              <span className="text-xs text-gray-400 mt-1">
                Rate: 1 {currency} = {rate} {fiatCurrency}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
