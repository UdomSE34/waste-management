import axios from "axios";

const API_BASE = "https://back.deploy.tz/api/notifications/";

export const NotificationService = {
  /**
   * Fetch notifications for a user or client
   * @param {"User"|"Client"} type - Type of the receiver/sender
   * @param {string} id - UUID of the user/client
   * @param {boolean} sent - If true, fetch sent messages (outbox)
   * @returns {Array} notifications
   */
  getNotifications: async (type, id, sent = false) => {
    try {
      const params = sent
        ? { sender_type: type, sender_id: id }
        : { recipient_type: type, recipient_id: id };

      const response = await axios.get(API_BASE, { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      return [];
    }
  },

  /**
   * Send a message (direct or broadcast)
   * @param {"User"|"Client"} senderType 
   * @param {string} senderId 
   * @param {string} messageContent 
   * @param {string|null} recipientId 
   * @param {"User"|"Client"|null} recipientType 
   */
  sendMessage: async (senderType, senderId, messageContent, recipientId = null, recipientType = null) => {
    try {
      // Only include recipient fields for direct messages
      const payload = {
        sender_type: senderType,
        sender_id: senderId,
        message_content: messageContent,
        ...(recipientType ? { recipient_type: recipientType } : {}),
        ...(recipientId ? { recipient_id: recipientId } : {}),
      };

      console.log("Sending payload:", payload); // Debug log

      const response = await axios.post(API_BASE, payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (err) {
      console.error("Failed to send message:", err);
      throw err;
    }
  },

  /**
   * Send a direct message from staff/user to client
   * @param {string} senderId 
   * @param {string} recipientId 
   * @param {string} messageContent 
   */
  sendDirectMessage: (senderId, recipientId, messageContent) =>
    NotificationService.sendMessage("User", senderId, messageContent, recipientId, "Client"),

  /**
   * Broadcast message from a client to all staff/admin
   * @param {string} clientId 
   * @param {string} messageContent 
   */
  clientBroadcast: (clientId, messageContent) =>
    NotificationService.sendMessage("Client", clientId, messageContent),

  /**
   * Mark a list of notifications as read
   * @param {Array<string>} notificationIds 
   */
  markAsRead: async (notificationIds) => {
    try {
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        throw new Error("notificationIds must be a non-empty array");
      }

      const payload = { notification_ids: notificationIds };
      const response = await axios.post(`${API_BASE}mark_as_read/`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
      throw err;
    }
  },
};
