import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { markAllNotificationsAsRead } from "@/lib/redux/slices/notificationSlice";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const dispatch = useAppDispatch();

  const { notifications, unreadNotifications } = useAppSelector(
    (state) => state.notification
  );

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <p className="font-medium">Notifications</p>
        {unreadNotifications > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>
      <div className="border-t"></div>

      {notifications.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No notifications yet
        </div>
      ) : (
        <div>
          {notifications.slice(0, 10).map((notification) => (
            <div
              key={notification.id}
              className={`cursor-pointer py-3 px-3 flex flex-col items-start gap-1 border-b ${
                !notification.read ? "bg-muted/30" : ""
              }`}
            >
              <div className="flex items-start justify-between w-full gap-2">
                <p className="font-medium text-sm">
                  {notification.title}
                  {!notification.read && (
                    <Badge
                      variant="outline"
                      className="ml-2 h-4 text-[10px] px-1 bg-blue-500/10 text-blue-500 border-blue-500/20"
                    >
                      New
                    </Badge>
                  )}
                </p>
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDistanceToNow(new Date(notification.timestamp), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {notification.message}
              </p>
            </div>
          ))}

          {notifications.length > 10 && (
            <div className="py-2 text-center text-muted-foreground text-sm">
              + {notifications.length - 10} more notifications
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Notifications;
