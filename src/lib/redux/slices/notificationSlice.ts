import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationMsg {
  id: string;
  title?: string;
  message?: string;
  type?: "info" | "success" | "error" | "warning";
  recipient?: string;
  txHash?: string | null;
  link?: string | null;
  icon?: string;
  timestamp?: number;
  read: boolean;
}

export interface ChatMsg {
  id: string;
  sender: string;
  recipient: string;
  message: string;
  type: "text" | "voice" | "transaction";
  timestamp: number;
  delivered: true;
  read: boolean;
  txHash: string;
  voiceURL: string | null;
}

interface NotificationState {
  notifications: NotificationMsg[];
  chats: ChatMsg[];
  unreadNotifications: number;
  unreadChats: number;
}

const initialState: NotificationState = {
  notifications: [],
  chats: [],
  unreadNotifications: 0,
  unreadChats: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationMsg>) => {
      state.notifications.unshift(action.payload);
      state.unreadNotifications += 1;
    },
    addChat: (state, action: PayloadAction<ChatMsg>) => {
      state.chats.unshift(action.payload);
      state.unreadChats += 1;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);
      }
    },
    markChatAsRead: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((n) => n.id === action.payload);
      if (chat && !chat.read) {
        chat.read = true;
        state.unreadChats = Math.max(0, state.unreadChats - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadNotifications = 0;
    },
    markAllChatsAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadChats = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = 0;
    },
    clearChats: (state) => {
      state.notifications = [];
      state.unreadChats = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload
      );
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadNotifications = Math.max(
            0,
            state.unreadNotifications - 1
          );
        }
      }
    },
    removeChat: (state, action: PayloadAction<string>) => {
      const index = state.chats.findIndex((n) => n.id === action.payload);
      if (index !== -1) {
        const wasUnread = !state.chats[index].read;
        state.chats.splice(index, 1);
        if (wasUnread) {
          state.unreadChats = Math.max(0, state.unreadChats - 1);
        }
      }
    },
  },
});

export const {
  addNotification,
  addChat,
  markNotificationAsRead,
  markChatAsRead,
  markAllNotificationsAsRead,
  markAllChatsAsRead,
  clearNotifications,
  clearChats,
  removeNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
