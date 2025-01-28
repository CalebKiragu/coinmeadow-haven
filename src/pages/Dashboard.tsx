import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BalanceCard from "@/components/dashboard/BalanceCard";
import TransactionButtons from "@/components/dashboard/TransactionButtons";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import NotificationBell from "@/components/shared/NotificationBell";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import MarketplaceOfferCard, { Offer } from "@/components/marketplace/MarketplaceOfferCard";

// Mock data for trending offers
const trendingOffers: Offer[] = [
  {
    id: "1",
    type: "buy",
    price: 65750.80,
    amount: 1.2,
    currency: "BTC",
    traderName: "TopTrader",
    traderRating: 4.9,
    completedTrades: 245,
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    type: "sell",
    price: 65700.50,
    amount: 0.8,
    currency: "BTC",
    traderName: "CryptoKing",
    traderRating: 4.7,
    completedTrades: 178,
    timestamp: new Date().toISOString(),
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">CoinDuka</h1>
          <NotificationBell />
        </div>
        
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <BalanceCard />
                <TransactionButtons />
                <TransactionHistory />
              </div>
              <div className="lg:col-span-1">
                <NotificationsPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marketplace">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Trending Offers</h2>
                <Link 
                  to="/marketplace"
                  className="text-white hover:text-gray-200 underline"
                >
                  View All Offers
                </Link>
              </div>
              <div className="space-y-4">
                {trendingOffers.map((offer) => (
                  <MarketplaceOfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;