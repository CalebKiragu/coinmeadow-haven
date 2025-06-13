import { store } from "../redux/store";
import {
  addNotification,
  NotificationMsg,
} from "../redux/slices/notificationSlice";

export const NotificationService = {
  // Check if browser supports notifications
  isSupported: (): boolean => {
    return "Notification" in window;
  },

  // Request permission for notifications
  requestPermission: async (): Promise<string> => {
    if (!NotificationService.isSupported()) {
      return "denied";
    }

    return await Notification.requestPermission();
  },

  // Send a push notification
  sendPushNotification: async (
    title: string,
    options: NotificationOptions = {}
  ): Promise<boolean> => {
    if (!NotificationService.isSupported()) {
      console.warn("Push notifications are not supported in this browser");
      return false;
    }

    const permission = await NotificationService.requestPermission();

    if (permission !== "granted") {
      console.warn("Notification permission was not granted");
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      notification.onclick = function () {
        window.focus();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error("Error displaying notification:", error);
      return false;
    }
  },

  // Add notification to Redux store and optionally show push notification
  addNotification: (
    notification: Partial<NotificationMsg>,
    showPush: boolean = true
  ): void => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    // Add to Redux store
    store.dispatch(
      addNotification({
        ...notification,
        id,
        timestamp,
        read: false,
      })
    );

    // Show push notification if requested
    if (showPush) {
      NotificationService.sendPushNotification(notification.title, {
        body: notification.message,
      });
    }
  },

  // Notify about a new transaction
  notifyNewTransaction: (
    txType: string,
    amount: string,
    currency: string
  ): void => {
    NotificationService.addNotification({
      title: `New ${txType} Transaction`,
      message: `${txType} of ${amount} ${currency} has been processed.`,
      type: "success",
    });
  },

  // Notify about transaction status change
  notifyTransactionStatus: (
    txId: string,
    status: string,
    type: string
  ): void => {
    const statusType =
      status === "CONFIRMED"
        ? "success"
        : status === "CANCELLED"
        ? "error"
        : "info";

    NotificationService.addNotification({
      title: `Transaction ${status.toLowerCase()}`,
      message: `Your ${type} transaction (ID: ${txId.substring(
        0,
        8
      )}...) has been ${status.toLowerCase()}.`,
      type: statusType as "success" | "error" | "info",
    });
  },

  // Notify about KYC verification status change
  notifyKycStatus: (status: string): void => {
    const statusType =
      status === "APPROVED"
        ? "success"
        : status === "REJECTED"
        ? "error"
        : "info";

    NotificationService.addNotification({
      title: `KYC Verification ${status.toLowerCase()}`,
      message: `Your KYC verification has been ${status.toLowerCase()}.`,
      type: statusType as "success" | "error" | "info",
    });
  },
};
