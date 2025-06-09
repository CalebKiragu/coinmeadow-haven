import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { ApiService } from "@/lib/services";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Chats from "./Chats";
import Notifications from "./Notifications";

const NotificationBell = () => {
  const [activeTab, setActiveTab] = useState("chats");

  const { unreadChats, unreadNotifications } = useAppSelector(
    (state) => state.notification
  );

  // Request notification permission when component mounts
  useEffect(() => {
    const requestPermission = async () => {
      await ApiService.requestPermission();
    };

    requestPermission();
  }, []);

  /**
   * Add separate tabs for Chats & Notifications
   * then integrate XMTP messaging to conveniently make txns.
   */

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
          {unreadChats > 0 ? (
            <>
              <BellRing className="h-6 w-6 text-white" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
              >
                {unreadChats > 9 ? "9+" : unreadChats}
              </Badge>
            </>
          ) : (
            <Bell className="h-6 w-6 text-white" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[320px] overflow-y-scroll scrollbar-none"
      >
        <Tabs
          defaultValue="chats"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full bg-transparent border border-white/10">
            <TabsTrigger
              value="chats"
              className="data-[state=active]:bg-gray-400 data-[state=active]:text-gray-800 text-gray-500"
            >
              Chats
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-gray-400 data-[state=active]:text-gray-800 text-gray-500"
            >
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="flex justify-center">
            <Chats />
          </TabsContent>

          <TabsContent value="notifications">
            <Notifications />
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
