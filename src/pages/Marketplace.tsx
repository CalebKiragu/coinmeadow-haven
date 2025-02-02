import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import MarketplaceOfferCard, { Offer } from "@/components/marketplace/MarketplaceOfferCard";
import { NavigationHeader } from "@/components/shared/NavigationHeader";

const mockOffers: Offer[] = [
  {
    id: "1",
    type: "buy",
    price: 65750.8,
    amount: 0.5,
    currency: "BTC",
    traderName: "CryptoMaster",
    traderRating: 4.8,
    completedTrades: 156,
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    type: "sell",
    price: 65800.2,
    amount: 0.75,
    currency: "BTC",
    traderName: "BitTrader",
    traderRating: 4.5,
    completedTrades: 89,
    timestamp: new Date().toISOString(),
  },
  // Add more mock offers as needed
];

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState("buy");
  const [currency, setCurrency] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [minRating, setMinRating] = useState("0");

  const filteredOffers = mockOffers
    .filter((offer) => offer.type === activeTab)
    .filter((offer) => currency === "all" || offer.currency === currency)
    .filter((offer) => offer.traderRating >= Number(minRating))
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "rating_desc":
          return b.traderRating - a.traderRating;
        case "newest":
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <NavigationHeader title="Marketplace" />

        <Tabs
          defaultValue="buy"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full mb-6">
            <TabsTrigger value="buy" className="flex-1">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex-1">
              Sell
            </TabsTrigger>
          </TabsList>

          <MarketplaceFilters
            currency={currency}
            setCurrency={setCurrency}
            sortBy={sortBy}
            setSortBy={setSortBy}
            minRating={minRating}
            setMinRating={setMinRating}
          />

          <TabsContent value="buy" className="space-y-4">
            {filteredOffers.map((offer) => (
              <MarketplaceOfferCard key={offer.id} offer={offer} />
            ))}
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            {filteredOffers.map((offer) => (
              <MarketplaceOfferCard key={offer.id} offer={offer} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Marketplace;
