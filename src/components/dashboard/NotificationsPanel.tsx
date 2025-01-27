import { Bell, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GlassCard from "../ui/GlassCard";

type Notification = {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
};

const notifications: Notification[] = [
  {
    id: 1,
    title: "Transaction Successful",
    message: "Your transfer of 0.5 ETH has been confirmed",
    date: "2024-02-20",
    read: false,
  },
  {
    id: 2,
    title: "New Login",
    message: "New login detected from Chrome browser",
    date: "2024-02-19",
    read: true,
  },
];

const NotificationsPanel = () => {
  return (
    <GlassCard className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          <Badge variant="secondary" className="ml-2">
            {notifications.filter(n => !n.read).length} new
          </Badge>
        </h2>
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg transition-colors ${
              notification.read ? "bg-white/20" : "bg-white/50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{notification.title}</h3>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <span className="text-xs text-gray-500">{notification.date}</span>
              </div>
              {notification.read && (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default NotificationsPanel;