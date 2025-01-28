import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Star, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <GlassCard className="animate-fade-in hover:bg-white/10 transition-all cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex flex-col">
        <div className="flex justify-between items-start p-4">
          <div className="flex gap-4">
            <div
              className={`p-2 rounded-full ${
                offer.type === "sell"
                  ? "bg-red-500/10 text-red-500"
                  : "bg-dollar-light/10 text-dollar-light"
              }`}
            >
              {offer.type === "sell" ? (
                <ArrowUpRight size={20} />
              ) : (
                <ArrowDownLeft size={20} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">
                {offer.amount} {offer.currency}
              </h3>
              <p className="text-sm text-white/70">
                @ ${offer.price.toLocaleString()} per {offer.currency}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-white">{offer.traderRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-white/70">{offer.traderName}</p>
            <p className="text-xs text-white/50">
              {offer.completedTrades} trades completed
            </p>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-white/10 animate-fade-in">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/50">Total Value</p>
                <p className="text-white font-medium">
                  ${(offer.price * offer.amount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-white/50">Posted</p>
                <p className="text-white font-medium">
                  {new Date(offer.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-white/50">Payment Methods</p>
                <p className="text-white font-medium">Bank Transfer, M-Pesa</p>
              </div>
              <div>
                <p className="text-white/50">Location</p>
                <p className="text-white font-medium">Nairobi, Kenya</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center p-2 border-t border-white/10">
          {isExpanded ? (
            <ChevronUp size={20} className="text-white/50" />
          ) : (
            <ChevronDown size={20} className="text-white/50" />
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default MarketplaceOfferCard;