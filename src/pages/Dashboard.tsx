import BalanceCard from "@/components/dashboard/BalanceCard";
import TransactionButtons from "@/components/dashboard/TransactionButtons";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import NotificationBell from "@/components/shared/NotificationBell";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">CoinDuka</h1>
          <NotificationBell />
        </div>
        
        <div className="space-y-8">
          <BalanceCard />
          <TransactionButtons />
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;