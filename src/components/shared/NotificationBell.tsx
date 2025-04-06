
import { useEffect } from "react";
import { Bell, BellRing } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { ApiService } from "@/lib/services";
import { markAllAsRead } from "@/lib/redux/slices/notificationSlice";
import { formatDistanceToNow } from "date-fns";

const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state) => state.notification);

  // Request notification permission when component mounts
  useEffect(() => {
    const requestPermission = async () => {
      await ApiService.requestPermission();
    };
    
    requestPermission();
  }, []);
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-6 w-6 text-white" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-6 w-6 text-white" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] max-h-[400px] overflow-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`cursor-pointer py-3 px-3 flex flex-col items-start gap-1 ${
                !notification.read ? "bg-muted/30" : ""
              }`}
            >
              <div className="flex items-start justify-between w-full gap-2">
                <span className="font-medium text-sm">
                  {notification.title}
                  {!notification.read && (
                    <Badge
                      variant="outline"
                      className="ml-2 h-4 text-[10px] px-1 bg-blue-500/10 text-blue-500 border-blue-500/20"
                    >
                      New
                    </Badge>
                  )}
                </span>
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{notification.message}</p>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 10 && (
          <DropdownMenuItem className="py-2 text-center text-muted-foreground text-sm">
            + {notifications.length - 10} more notifications
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
