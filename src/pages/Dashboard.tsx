import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  User,
  ShieldCheck,
  Settings,
  LogOut,
  History,
  Headset,
  Code,
} from "lucide-react";
import BalanceCard from "@/components/dashboard/BalanceCard";
import TransactionButtons from "@/components/dashboard/TransactionButtons";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import NotificationBell from "@/components/shared/NotificationBell";
import ThemeToggle from "@/components/shared/ThemeToggle";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import MarketplaceOfferCard, {
  Offer,
} from "@/components/marketplace/MarketplaceOfferCard";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";
import KycBanner from "@/components/verification/KycBanner";
import { usePasskeyAuth } from "@/hooks/usePasskeyAuth";
import { ApiService } from "@/lib/services";
import { WalletService } from "@/lib/services/walletService";
import { setShowBalance as setReduxShowBalance } from "@/lib/redux/slices/walletSlice";

// Define the Charge interface
interface Charge {
  id?: string;
  status?: string;
}

const trendingOffers: Offer[] = [
  {
    id: "1",
    type: "buy",
    price: 65750.8,
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
    price: 65700.5,
    amount: 0.8,
    currency: "BTC",
    traderName: "CryptoKing",
    traderRating: 4.7,
    completedTrades: 178,
    timestamp: new Date().toISOString(),
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("wallet");
  const [localShowBalance, setLocalShowBalance] = useState(false);
  const [chargeStatus, setChargeStatus] = useState<string | null>(null);
  
  const { verifyPasskey, isPasskeyVerified } = usePasskeyAuth();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const walletState = useAppSelector((state) => state.wallet);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    const initPasskeyAuth = async () => {
      try {
        const verified = await verifyPasskey();
        setLocalShowBalance(verified);
        // Make sure we update Redux state too
        dispatch(setReduxShowBalance(verified));
      } catch (error) {
        console.log("Initial passkey verification skipped or failed");
      }
    };
    
    const prefetchData = async () => {
      try {
        await ApiService.getTransactionHistory();
      } catch (error) {
        console.error("Error prefetching transaction data:", error);
      }
    };
    
    // Check for chargeId in URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const chargeId = queryParams.get('chargeId');
    
    if (chargeId) {
      const checkChargeStatus = async () => {
        try {
          const charge = await WalletService.queryCharge({ chargeId }) as Charge;
          if (charge && typeof charge.status === 'string') {
            setChargeStatus(charge.status);
            // Further processing based on status can be done here
            console.log('Charge status:', charge.status);
          } else {
            setChargeStatus('unknown');
          }
        } catch (error) {
          console.error('Error querying charge:', error);
          setChargeStatus('error');
        }
      };
      
      checkChargeStatus();
    }
    
    initPasskeyAuth();
    prefetchData();
  }, [isAuthenticated, navigate, verifyPasskey, location.search, dispatch]);

  useEffect(() => {
    // Synchronize with redux store's showBalance if available
    if (walletState && walletState.showBalance !== undefined) {
      setLocalShowBalance(walletState.showBalance);
    }
  }, [walletState]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const handleBalanceToggle = (newValue: boolean) => {
    setLocalShowBalance(newValue);
    dispatch(setReduxShowBalance(newValue));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee dark:from-coffee-dark dark:via-coffee-dark to-black/40 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-2">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold text-white">CoinDuka</h1>
            <span className="text-sm text-white/70">
              Your trustless crypto partner
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <NotificationBell />
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Menu className="h-6 w-6 text-white" />
                </button>
              </SheetTrigger>
              <SheetContent className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border-l border-white/20">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    to="/account"
                    className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>Account</span>
                  </Link>
                  <Link
                    to="/history"
                    className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <History className="h-5 w-5" />
                    <span>History</span>
                  </Link>
                  <Link
                    to="/verification"
                    className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    <span>Verification</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    to="/apidocs"
                    className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Code className="h-5 w-5" />
                    <span>Developers</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-red-500"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <KycBanner />

        <Tabs
          defaultValue="wallet"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full mb-6 bg-transparent border border-white/10">
            <TabsTrigger
              value="wallet"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              Wallet
            </TabsTrigger>
            <TabsTrigger
              value="trade"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              Trade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <BalanceCard
                  showBalance={localShowBalance}
                  setShowBalance={handleBalanceToggle}
                />
                <h3 className="text-lg text-white/80 text-center">
                  What would you like to do today?
                </h3>
                <TransactionButtons />
                <TransactionHistory
                  showBalance={localShowBalance}
                  setShowBalance={handleBalanceToggle}
                />
              </div>
              <div className="lg:col-span-1">
                <NotificationsPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trade">
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-white">
                  Trending Offers
                </h2>
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

        <Button
          onClick={() => window.open("https://wa.me/+254713278107", "_blank")}
          className="fixed bottom-8 right-8 rounded-full p-4 bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center gap-2 animate-fade-in"
        >
          <Headset className="h-5 w-5" />
          <span>Contact Support</span>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
