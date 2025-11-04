// src/services/NotificationService.js
import axios from "axios";

const API_BASE = "https://back.deploy.tz/api/notifications/";
// const API_BASE = "http://127.0.0.1:8000/api/notifications/";

const api = axios.create({ baseURL: API_BASE });

// Attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    } else {
      console.warn("⚠️ No authToken found in localStorage");
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

export const NotificationService = {
  /**
   * Fetch inbox (received) messages, including broadcasts.
   * @param {string} recipientType - "User" or "Client"
   * @param {string} recipientId - UUID of recipient
   */
  getInbox: async (recipientType, recipientId) => {
    const token = localStorage.getItem("authToken");
    if (!token) return [];

    if (!recipientType || !recipientId) {
      console.error("❌ recipientType and recipientId required for inbox");
      return [];
    }

    try {
      const params = {
        recipient_type: recipientType,
        recipient_id: recipientId,
      };
      console.log("📥 Fetching inbox:", params);
      const response = await api.get("", { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("❌ Inbox fetch failed:", err.response?.data || err.message);
      return [];
    }
  },

  /**
   * Fetch outbox (sent) messages
   * @param {string} senderType - "User" or "Client"
   * @param {string} senderId - UUID of sender
   */
  getOutbox: async (senderType, senderId) => {
    const token = localStorage.getItem("authToken");
    if (!token) return [];

    if (!senderType || !senderId) {
      console.error("❌ senderType and senderId required for outbox");
      return [];
    }

    try {
      const params = {
        sender_type: senderType,
        sender_id: senderId,
      };
      console.log("📤 Fetching outbox:", params);
      const response = await api.get("", { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("❌ Outbox fetch failed:", err.response?.data || err.message);
      return [];
    }
  },

  /**
   * Send a message (direct or broadcast)
   * @param {string} senderType
   * @param {string} senderId
   * @param {string} messageContent
   * @param {string|null} recipientType - "User" or "Client", or null for broadcast
   * @param {string|null} recipientId - UUID of recipient, or null for broadcast
   */
  sendMessage: async (senderType, senderId, messageContent, recipientType = null, recipientId = null) => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    try {
      const payload = {
        sender_type: senderType,
        sender_id: senderId,
        message_content: messageContent,
        recipient_type: recipientType || null,
        recipient_id: recipientId || null,
      };

      console.log("✉️ Sending message:", payload);
      const response = await api.post("", payload);
      return response.data;
    } catch (err) {
      console.error("❌ Send message failed:", err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Mark notifications as read
   * @param {string[]} notificationIds - Array of UUIDs
   */
  markAsRead: async (notificationIds) => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      console.error("❌ notificationIds must be a non-empty array");
      return;
    }

    try {
      const response = await api.post("mark_as_read/", {
        notification_ids: notificationIds,
      });
      return response.data;
    } catch (err) {
      console.error("❌ Mark as read failed:", err.response?.data || err.message);
      throw err;
    }
  },
};
