import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, ShieldCheck, Settings, LogOut, History } from "lucide-react";
import BalanceCard from "@/components/dashboard/BalanceCard";
import TransactionButtons from "@/components/dashboard/TransactionButtons";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import NotificationBell from "@/components/shared/NotificationBell";
import ThemeToggle from "@/components/shared/ThemeToggle";
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
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold text-white">CoinDuka</h1>
            <span className="text-sm text-white/70">Your trusted crypto partner</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Menu className="h-6 w-6 text-white" />
                </button>
              </SheetTrigger>
              <SheetContent className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border-l border-white/20">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/account" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors">
                    <User className="h-5 w-5" />
                    <span>Account</span>
                  </Link>
                  <Link to="/history" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors">
                    <History className="h-5 w-5" />
                    <span>History</span>
                  </Link>
                  <Link to="/verification" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Verification</span>
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-red-500">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <h3 className="text-lg text-white/80 text-center mt-8 mb-4">What would you like to do today?</h3>
        <div className="transform-gpu transition-all duration-300 hover:scale-105">
          <TransactionButtons />
        </div>

        <Tabs 
          defaultValue="overview" 
          className="w-full" 
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full mb-6 bg-transparent border border-white/10">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="marketplace"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <BalanceCard />
                <h3 className="text-lg text-white/80 text-center">What would you like to do today?</h3>
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
                  className="text-dollar-light hover:text-dollar-dark transition-colors"
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
