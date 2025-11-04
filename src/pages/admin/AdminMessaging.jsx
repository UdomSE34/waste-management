import { useState, useEffect } from "react";
import { NotificationService } from "../../services/NotificationService";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const api = axios.create({ baseURL: "https://back.deploy.tz/api/" });
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    } else {
      console.warn("No authToken for recipients fetch");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AdminMessaging = () => {
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [error, setError] = useState(null);

  const loggedUserId = localStorage.getItem("userId") || "";
  const loggedUserName = localStorage.getItem("userName") || "";
  const navigate = useNavigate();

  const isAuthenticated = () => {
    const token = localStorage.getItem("authToken");
    return token && loggedUserId;
  };

  const normalizeId = (obj, prefix) => {
    if (!obj) return null;
    return obj.id || obj[`${prefix}_id`] || null;
  };
  const normalizeType = (obj, prefix) => {
    if (!obj) return null;
    return obj.type || obj[`${prefix}_type`] || null;
  };

  const fetchRecipients = async () => {
    if (!isAuthenticated()) {
      setError("Please log in to view recipients");
      return;
    }
    try {
      setError(null);
      const [usersData, clientsData] = await Promise.all([
        api.get("users/").then((res) => res.data),
        api.get("clients/").then((res) => res.data),
      ]);

      setUsers(
        Array.isArray(usersData)
          ? usersData.filter((u) => u.user_id !== loggedUserId)
          : []
      );
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (err) {
      console.error("❌ Error fetching recipients:", err);
      setError("Failed to load recipients. Please try again.");
      setUsers([]);
      setClients([]);
    }
  };

  const fetchMessages = async (recipientId = null, recipientType = null) => {
    if (!loggedUserId) return;
    setLoading(true);

    try {
      // 1️⃣ Inbox: received messages for logged-in admin/staff (includes broadcasts)
      const received = await NotificationService.getNotifications("User", loggedUserId, false);

      // 2️⃣ Outbox: messages sent by logged-in admin/staff
      const sent = await NotificationService.getNotifications("User", loggedUserId, true);

      // Combine
      let allMessages = [...(received || []), ...(sent || [])];

      // 3️⃣ Filter if specific recipient is selected
      if (recipientId && recipientType) {
        allMessages = allMessages.filter((msg) => {
          const senderId = normalizeId(msg.sender, "sender");
          const senderType = normalizeType(msg.sender, "sender");
          const recId = normalizeId(msg.recipient, "recipient");
          const recType = normalizeType(msg.recipient, "recipient");

          // Broadcast (Client sender, recipient null)
          if (senderType === "Client" && !recId) return true;

          // Messages from selected recipient to me
          if (senderId === recipientId && senderType === recipientType && recId === loggedUserId) return true;

          // Messages I sent to selected recipient
          if (senderId === loggedUserId && recId === recipientId && recType === recipientType) return true;

          return false;
        });
      }

      allMessages.sort((a, b) => new Date(a.created_time) - new Date(b.created_time));
      setMessages(allMessages);
    } catch (err) {
      console.error("❌ Failed to fetch messages:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchRecipients();
    fetchMessages();
  }, [loggedUserId, navigate]);

  useEffect(() => {
    if (!isAuthenticated() || !selectedRecipient) return;
    const [type, id] = selectedRecipient.split("|");
    fetchMessages(id, type);
  }, [selectedRecipient]);

  const sendMessage = async () => {
    if (!isAuthenticated() || !newMessage.trim() || !selectedRecipient) {
      setError("Please log in and select a recipient to send a message");
      return;
    }
    const [recipientType, recipientId] = selectedRecipient.split("|");

    try {
      setError(null);
      await NotificationService.sendMessage(
        "User",
        loggedUserId,
        newMessage,
        recipientId,
        recipientType
      );

      const sentMessage = {
        notification_id: Date.now(),
        message_content: newMessage,
        sender: { id: loggedUserId, type: "User", name: loggedUserName },
        created_time: new Date().toISOString(),
        recipient_id: recipientId,
        recipient_type: recipientType,
      };

      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
    } catch (err) {
      console.error("❌ Send failed:", err);
      setError("Failed to send message.");
    }
  };

  const getSenderName = (msg) => {
    if (!msg?.sender) return "Unknown";
    if (msg.sender.type === "Client")
      return `Client: ${msg.sender.name || msg.sender.email || "Unknown"}`;
    if (msg.sender.type === "User")
      return `Staff/Admin: ${msg.sender.name || msg.sender.email || "Unknown"}`;
    return "Unknown";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px" }}>
      <h2>Messaging</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Recipient selector */}
      <div style={{ marginBottom: "16px" }}>
        <select
          value={selectedRecipient}
          onChange={(e) => setSelectedRecipient(e.target.value)}
          disabled={loading}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", width: "100%" }}
        >
          <option value="">Select Recipient (Client / Staff / Admin)</option>
          {clients.map((c) => (
            <option key={`client-${c.client_id}`} value={`Client|${c.client_id}`}>
              Client: {c.name || c.email || "Unknown"}
            </option>
          ))}
          {users.map((u) => (
            <option key={`user-${u.user_id}`} value={`User|${u.user_id}`}>
              {u.role}: {u.name || u.email || "Unknown"}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "16px",
          background: "#fafafa",
        }}
      >
        {loading ? (
          <p>Loading messages...</p>
        ) : error ? (
          <p>{error}</p>
        ) : messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?.id === loggedUserId;
            return (
              <div
                key={msg.notification_id}
                style={{
                  maxWidth: "80%",
                  marginLeft: isMe ? "auto" : 0,
                  marginRight: isMe ? 0 : "auto",
                  padding: "10px 14px",
                  borderRadius: "16px",
                  backgroundColor: isMe ? "#007bff" : "#f1f1f1",
                  color: isMe ? "white" : "black",
                  marginBottom: "8px",
                }}
              >
                <div style={{ fontWeight: 500, fontSize: "0.85rem" }}>
                  {getSenderName(msg)}
                </div>
                <div>{msg.message_content || ""}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.8, textAlign: "right" }}>
                  {msg.created_time
                    ? new Date(msg.created_time).toLocaleTimeString()
                    : ""}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ddd",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || !selectedRecipient || !isAuthenticated()}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "20px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AdminMessaging;
