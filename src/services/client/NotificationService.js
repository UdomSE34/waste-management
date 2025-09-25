import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/notifications/";

// Axios instance with dynamic token
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
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
      const response = await api.get("/", { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("Failed to fetch notifications:", err.response?.data || err.message);
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
      const response = await api.post("/", payload);
      return response.data;
    } catch (err) {
      console.error("Failed to send message:", err.response?.data || err.message);
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
      const response = await api.post("mark_as_read/", { notification_ids: notificationIds });
      return response.data;
    } catch (err) {
      console.error("Failed to mark notifications as read:", err.response?.data || err.message);
      throw err;
    }
  },
};
