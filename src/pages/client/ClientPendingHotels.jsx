// src/pages/client/ClientPendingHotels.jsx
import { useState, useEffect } from "react";
import { getPendingHotels } from "../../services/client/pendingHotelServices";
import DataTable from "../../components/client/DataTable";
import { NotificationService } from "../../services/client/NotificationService"; // updated import
import axios from "axios";

const ClientPendingHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState("all-staff");

  // Logged-in user info
  const loggedUserId = localStorage.getItem("userId");   
  const userRole = localStorage.getItem("userRole");     

  // Fetch pending hotels
  const fetchPendingHotels = async () => {
    setLoading(true);
    try {
      const data = await getPendingHotels();
      if (!Array.isArray(data)) throw new Error("Invalid data format");

      const clientHotels = data
        .filter((hotel) => hotel.client === loggedUserId)
        .map((hotel) => ({
          id: hotel.id,
          name: hotel.name,
          address: hotel.address,
          email: hotel.email,
          contact_phone: hotel.contact_phone,
          hadhi: hotel.hadhi,
          total_rooms: hotel.total_rooms,
          type: hotel.type,
          waste_per_day: hotel.waste_per_day,
          collection_frequency: hotel.collection_frequency,
          currency: hotel.currency,
          payment_account: hotel.payment_account,
          status: hotel.status,
        }));

      setHotels(clientHotels);
      setError(null);
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError(err.message || "Failed to load hotels.");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingHotels();
  }, []);

  // Fetch all users (Staff/Admin) for recipient dropdown
  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://back.deploy.tz/api/users/");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Fetch messages and mark unread as read
  const fetchMessages = async () => {
    try {
      let userMessages = [];

      if (userRole === "client") {
        userMessages = await NotificationService.getNotifications("Client", loggedUserId);
      } else {
        const allMsgs = await NotificationService.getNotifications("User", loggedUserId);
        userMessages =
          selectedRecipient === "all-staff"
            ? allMsgs
            : allMsgs.filter((msg) => msg.sender?.id === selectedRecipient);
      }

      setMessages(userMessages);

      // Automatically mark unread messages as read
      const unreadIds = userMessages
        .filter((msg) => msg.status !== "Read")
        .map((msg) => msg.notification_id);
      if (unreadIds.length > 0) {
        await NotificationService.markAsRead(unreadIds);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      if (userRole === "client") {
        await NotificationService.clientBroadcast(loggedUserId, newMessage);
      } else if (selectedRecipient && selectedRecipient !== "all-staff") {
        await NotificationService.sendDirectMessage(loggedUserId, selectedRecipient, newMessage);
      } else {
        alert("Please select a client to message.");
        return;
      }

      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Send failed:", err);
      alert("Failed to send message. Check console for details.");
    }
  };

  // Load users & messages when chat opens
  useEffect(() => {
    if (showChat) {
      if (userRole !== "client") fetchUsers();
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [showChat, selectedRecipient]);

  // Helper functions for display
  const getSenderName = (msg) => {
    if (msg.sender?.type === "Client") return `Client: ${msg.sender.name}`;
    if (msg.sender?.type === "User") return `Staff: ${msg.sender.name}`;
    return "Unknown Sender";
  };

  return (
    <div className="content">
      <div className="page-header d-flex justify-content-between align-items-center">
        <h2>Registration Information</h2>
        {/* <button className="btn btn-primary" onClick={() => setShowChat(!showChat)}>
          💬 Messages
        </button> */}
      </div>
      <br />

      {loading && <div className="loading-indicator">Loading hotels...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      {!loading && !error && (
        <div className="card">
          <DataTable
            columns={[
              "Name","Address","Contact","Email","Hadhi","Rooms","Type",
              "Waste/Day","Collection Freq.","Currency","Account","Status",
            ]}
            rows={hotels.map((hotel) => ({
              Name: hotel.name,
              Address: hotel.address,
              Contact: hotel.contact_phone,
              Email: hotel.email,
              Hadhi: hotel.hadhi,
              Rooms: hotel.total_rooms,
              Type: hotel.type,
              "Waste/Day": hotel.waste_per_day,
              "Collection Freq.": hotel.collection_frequency,
              Currency: hotel.currency,
              Account: hotel.payment_account,
              Status: hotel.status,
            }))}
          />
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div style={{
          position: "fixed", top: "50%", right: 0, transform: "translateY(-50%)",
          width: "320px", height: "90vh", backgroundColor: "#fff", borderRadius: "16px 0 0 16px",
          boxShadow: "-10px 0 20px rgba(0,0,0,0.1)", zIndex: 1000, overflow: "hidden",
          display: "flex", flexDirection: "column", borderLeft: "4px solid #007bff"
        }}>
          {/* Header */}
          <div style={{
            padding: "16px", borderBottom: "1px solid #eee", backgroundColor: "#f8f9fa",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <h5 style={{ margin: 0 }}>Messages</h5>
            <button onClick={() => setShowChat(false)} style={{
              background: "none", border: "none", fontSize: "20px", color: "#6c757d", cursor: "pointer"
            }}>×</button>
          </div>

          {/* Recipient Selector */}
          {userRole !== "client" && (
            <div style={{ padding: "0 16px 10px" }}>
              <select value={selectedRecipient} onChange={(e) => setSelectedRecipient(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
                <option value="all-staff">All Clients (Select one)</option>
                {users.filter(u => u.role === "client").map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.name || u.email}</option>
                ))}
              </select>
            </div>
          )}

          {/* Messages List */}
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6c757d", margin: 0 }}>No messages yet.</p>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender?.id === loggedUserId;
                return (
                  <div key={msg.notification_id} style={{
                    maxWidth: "80%", marginLeft: isMe ? "auto" : 0, marginRight: isMe ? 0 : "auto",
                    padding: "10px 14px", borderRadius: "16px",
                    backgroundColor: isMe ? "#007bff" : "#f1f1f1",
                    color: isMe ? "white" : "black", lineHeight: 1.4
                  }}>
                    <div style={{ fontWeight: 500, fontSize: "0.85rem" }}>{getSenderName(msg)}</div>
                    <div style={{ marginTop: "4px" }}>{msg.message_content}</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8, textAlign: "right", marginTop: "4px" }}>
                      {new Date(msg.created_time).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "16px", borderTop: "1px solid #eee", display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder={userRole === "client" ? "Ask support..." :
                selectedRecipient === "all-staff" ? "Select a client first" : "Reply..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={userRole !== "client" && selectedRecipient === "all-staff"}
              style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "20px", outline: "none" }}
            />
            <button onClick={sendMessage} disabled={!newMessage.trim() || (userRole !== "client" && selectedRecipient === "all-staff")}
              style={{ background: "#007bff", color: "white", border: "none", padding: "10px 16px", borderRadius: "20px", cursor: "pointer" }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPendingHotels;
