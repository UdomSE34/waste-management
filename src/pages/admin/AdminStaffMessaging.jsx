import { useState, useEffect } from "react";
import { NotificationService } from "../../services/NotificationService";

const AdminMessaging = () => {
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [recentChats, setRecentChats] = useState([]);

  const loggedUserId = localStorage.getItem("userId") || "";
  const loggedUserName = localStorage.getItem("userName") || "";

  // Fetch all users and clients for dropdown
  const fetchRecipients = async () => {
    try {
      const resUsers = await fetch("http://127.0.0.1:8000/api/users/");
      const usersData = await resUsers.json();
      setUsers(
        Array.isArray(usersData)
          ? usersData.filter((u) => u.user_id !== loggedUserId)
          : []
      );

      const resClients = await fetch("http://127.0.0.1:8000/api/clients/");
      const clientsData = await resClients.json();
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (err) {
      console.error("Error fetching recipients:", err);
      setUsers([]);
      setClients([]);
    }
  };

  // Fetch conversation between logged-in user and selected recipient
const fetchMessages = async (recipientId = null, recipientType = null) => {
  if (!loggedUserId) return;
  setLoading(true);

  try {
    // Fetch inbox + outbox for logged user
    const received = await NotificationService.getNotifications("User", loggedUserId, false);
    const sent = await NotificationService.getNotifications("User", loggedUserId, true);

    // Combine both lists
    let allMessages = [
      ...(Array.isArray(received) ? received : []),
      ...(Array.isArray(sent) ? sent : []),
    ];

    console.log("🔎 Raw messages from API:", allMessages);

    // If a conversation is selected, filter down to it
    if (recipientId && recipientType) {
      console.log("Filtering for conversation:", {
        loggedUserId,
        recipientId,
        recipientType,
      });

      allMessages = allMessages.filter((msg) => {
        // Normalize sender/recipient fields
        const senderId = msg.sender?.id || msg.sender_id;
        const senderType = msg.sender?.type || msg.sender_type;
        const recId = msg.recipient?.id || msg.recipient_id;
        const recType = msg.recipient?.type || msg.recipient_type;

        // Case 1: partner (User/Client) sent to me (User)
        if (
          senderId === recipientId &&
          senderType === recipientType &&
          recId === loggedUserId
        ) {
          return true;
        }

        // Case 2: I (User) sent to partner
        if (
          senderId === loggedUserId &&
          recId === recipientId &&
          recType === recipientType
        ) {
          return true;
        }

        // Case 3 (special): Client → me, but recipient_id is missing/null
        if (
          recipientType === "Client" &&
          senderType === "Client" &&
          senderId === recipientId &&
          (!recId || recType === null) // API didn’t give recipient
        ) {
          return true;
        }

        return false;
      });
    }

    // Sort chronologically
    allMessages.sort((a, b) => new Date(a.created_time) - new Date(b.created_time));

    console.log("✅ Filtered conversation messages:", allMessages);

    setMessages(allMessages);

    // Build/update recent chats list
    const chatsMap = {};
    [...received, ...sent].forEach((msg) => {
      const senderId = msg.sender?.id || msg.sender_id;
      const senderType = msg.sender?.type || msg.sender_type;
      const senderName = msg.sender?.name || msg.sender_name;

      const recId = msg.recipient?.id || msg.recipient_id;
      const recType = msg.recipient?.type || msg.recipient_type;
      const recName = msg.recipient?.name || msg.recipient_name;

      const chatPartner =
        senderId === loggedUserId
          ? { id: recId, type: recType, name: recName }
          : { id: senderId, type: senderType, name: senderName };

      if (chatPartner.id) {
        chatsMap[`${chatPartner.type}|${chatPartner.id}`] = {
          key: `${chatPartner.type}|${chatPartner.id}`,
          name: chatPartner.name || "Unknown",
          type: chatPartner.type,
          lastMessage: msg.message_content,
          time: msg.created_time,
        };
      }
    });

    const recentList = Object.values(chatsMap).sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    );
    setRecentChats(recentList);
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    setMessages([]);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchRecipients();
    fetchMessages();
  }, [loggedUserId]);

  useEffect(() => {
    if (!selectedRecipient) return;
    const [type, id] = selectedRecipient.split("|");
    fetchMessages(id, type);
  }, [selectedRecipient]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRecipient) return;
    const [recipientType, recipientId] = selectedRecipient.split("|");

    try {
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

      // Refresh chats
      fetchMessages(recipientId, recipientType);
    } catch (err) {
      console.error("Send failed:", err);
      alert("Failed to send message. Check console for details.");
    }
  };

  const getSenderName = (msg) => {
    if (!msg || !msg.sender) return "Unknown";
    if (msg.sender.type === "Client")
      return `Client: ${msg.sender.name || msg.sender.email || "Unknown"}`;
    if (msg.sender.type === "User")
      return `Staff/Admin: ${msg.sender.name || msg.sender.email || "Unknown"}`;
    return "Unknown";
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Sidebar: Recent chats */}
      <div style={{ width: "280px", borderRight: "1px solid #ddd", overflowY: "auto", padding: "12px" }}>
        <h3 style={{ marginBottom: "12px" }}>Recent Chats</h3>
        {recentChats.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#666" }}>No recent chats</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {recentChats.map((chat) => (
              <li
                key={chat.key}
                onClick={() => setSelectedRecipient(chat.key)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  background: selectedRecipient === chat.key ? "#e6f0ff" : "transparent",
                  marginBottom: "6px",
                }}
              >
                <div style={{ fontWeight: 500 }}>{chat.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#555" }}>
                  {chat.lastMessage?.slice(0, 30)}...
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column" }}>
        <h2>Messaging</h2>

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
        <div style={{ flex: 1, overflowY: "auto", border: "1px solid #ddd", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?.id === loggedUserId;
              const createdTime = msg.created_time
                ? new Date(msg.created_time).toLocaleTimeString()
                : "";
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
                    {createdTime}
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
            style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ddd" }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !selectedRecipient}
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
    </div>
  );
};

export default AdminMessaging;
