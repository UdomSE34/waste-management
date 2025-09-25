import axios from "axios";

const API_BASE = "/api/notifications/";

// Authenticated axios instance
const api = axios.create({
  baseURL: API_BASE,
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const NotificationService = {
  getNotifications: async (type, id, sent = false) => {
    try {
      const params = sent
        ? { sender_type: type, sender_id: id }
        : { recipient_type: type, recipient_id: id };

      const response = await api.get("", { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      return [];
    }
  },

  sendMessage: async (senderType, senderId, messageContent, recipientId = null, recipientType = null) => {
    try {
      const payload = {
        sender_type: senderType,
        sender_id: senderId,
        message_content: messageContent,
        ...(recipientType ? { recipient_type: recipientType } : {}),
        ...(recipientId ? { recipient_id: recipientId } : {}),
      };

      console.log("Sending payload:", payload);

      const response = await api.post("", payload);
      return response.data;
    } catch (err) {
      console.error("Failed to send message:", err);
      throw err;
    }
  },

  sendDirectMessage: (senderId, recipientId, messageContent) =>
    NotificationService.sendMessage("User", senderId, messageContent, recipientId, "Client"),

  clientBroadcast: (clientId, messageContent) =>
    NotificationService.sendMessage("Client", clientId, messageContent),

  markAsRead: async (notificationIds) => {
    try {
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        throw new Error("notificationIds must be a non-empty array");
      }

      const payload = { notification_ids: notificationIds };
      const response = await api.post("mark_as_read/", payload);
      return response.data;
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
      throw err;
    }
  },
};
