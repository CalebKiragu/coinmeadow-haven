import { ArrowUpRight, ArrowDownLeft, Star } from "lucide-react";
import GlassCard from "../ui/GlassCard";

export type Offer = {
  id: string;
  type: "buy" | "sell";
  price: number;
  amount: number;
  currency: string;
  traderName: string;
  traderRating: number;
  completedTrades: number;
  timestamp: string;
};

const MarketplaceOfferCard = ({ offer }: { offer: Offer }) => {
  return (
    <GlassCard className="animate-fade-in hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex justify-between items-start p-4">
        <div className="flex gap-4">
          <div
            className={`p-2 rounded-full ${
              offer.type === "sell"
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {offer.type === "sell" ? (
              <ArrowUpRight size={20} />
            ) : (
              <ArrowDownLeft size={20} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {offer.amount} {offer.currency}
            </h3>
            <p className="text-sm text-gray-600">
              @ ${offer.price.toLocaleString()} per {offer.currency}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{offer.traderRating.toFixed(1)}</span>
          </div>
          <p className="text-sm text-gray-600">{offer.traderName}</p>
          <p className="text-xs text-gray-500">
            {offer.completedTrades} trades completed
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default MarketplaceOfferCard;