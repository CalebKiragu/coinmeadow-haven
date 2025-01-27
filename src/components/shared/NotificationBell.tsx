import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotificationBell = () => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-white/20 transition-colors"
    >
      <Bell className="h-5 w-5" />
      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
        3
      </span>
    </Button>
  );
};

export default NotificationBell;