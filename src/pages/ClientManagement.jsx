import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clientService from "../services/clientService";
import DataTable from "../components/DataTable";

const ClientManagement = () => {
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const initialClientState = {
    name: "",
    phone: "",
    email: "",
    address: "",
    password: "",
  };

  const [newClient, setNewClient] = useState(initialClientState);

  // Check authentication before loading
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Load all clients
  const loadClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientService.getAllClients();
      
      console.log("📡 API Response:", response);
      
      // Handle different response structures
      if (response.clients && Array.isArray(response.clients)) {
        // Response has {count, clients} structure
        const transformedClients = response.clients.map((client) => ({
          id: client.client_id || client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          address: client.address,
          created_at: client.created_at,
        }));
        setClients(transformedClients);
      } else if (response.results && Array.isArray(response.results)) {
        // Response has paginated structure {results, count, next, previous}
        const transformedClients = response.results.map((client) => ({
          id: client.client_id || client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          address: client.address,
          created_at: client.created_at,
        }));
        setClients(transformedClients);
      } else if (Array.isArray(response)) {
        // Response is direct array
        const transformedClients = response.map((client) => ({
          id: client.client_id || client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          address: client.address,
          created_at: client.created_at,
        }));
        setClients(transformedClients);
      } else {
        console.warn("Unexpected response format:", response);
        setClients([]);
      }
      
    } catch (error) {
      console.error("❌ Error loading clients:", error);
      
      if (error.response?.status === 401) {
        setError("Unauthorized: Please login again.");
        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else if (error.response?.status === 403) {
        setError("Forbidden: You don't have permission to access this resource.");
      } else {
        setError(error.message || "Hitilafu ya kupakua orodha ya wateja.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  // Create new client
  const handleCreateClient = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingClient) {
        // For update, only include password if it's not empty
        const updateData = { ...newClient };
        if (!updateData.password) {
          delete updateData.password;
        }
        await clientService.updateClient(editingClient.id, updateData);
        alert("✅ Client updated successfully!");
      } else {
        await clientService.createClient(newClient);
        alert("✅ Client registered successfully!");
      }
      
      setShowModal(false);
      setEditingClient(null);
      setNewClient(initialClientState);
      setShowPassword(false);
      loadClients();
      
    } catch (error) {
      console.error("❌ Error saving client:", error);
      
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        alert("Forbidden: You don't have permission to perform this action.");
      } else {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.detail || 
                           "Hitilafu imetokea. Tafadhali jaribu tena.";
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit client
  const handleEditClient = (client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      password: "", // Start with empty password
    });
    setShowPassword(false);
    setShowModal(true);
  };

  // Delete client
  const handleDeleteClient = async (clientId, clientName) => {
    if (window.confirm(`Are you sure you want to delete client "${clientName}"?`)) {
      setLoading(true);
      try {
        await clientService.deleteClient(clientId);
        alert("✅ Client deleted successfully!");
        loadClients();
      } catch (error) {
        console.error("❌ Error deleting client:", error);
        
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/login");
        } else if (error.response?.status === 403) {
          alert("Forbidden: You don't have permission to delete clients.");
        } else {
          const errorMessage = error.response?.data?.message || 
                             error.response?.data?.detail || 
                             "Hitilafu imetokea. Tafadhali jaribu tena.";
          alert(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setNewClient(initialClientState);
    setShowPassword(false);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery)
  );

  // Retry loading clients
  const handleRetry = () => {
    loadClients();
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>Customer Management</h2>
      </div>
      <br />

      {loading && <div className="loading-indicator">Loading clients...</div>}
      
      {error && (
        <div className="error-message">
          ❌ {error}
          <div style={{ marginTop: '10px' }}>
            <button className="btn btn-primary" onClick={handleRetry}>
              Please try again
            </button>
            {error.includes("Unauthorized") && (
              <button className="btn btn-secondary" onClick={() => navigate("/login")} style={{ marginLeft: '10px' }}>
                Please login again
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-header">
                <h3>Registered Clients</h3>
                <span>👥</span>
              </div>
              <h4>{clients.length}</h4>
              <p>Total number of clients</p>
            </div>
          </div>

          {/* Clients Table */}
          <div className="card">
            <div className="card-header">
              <h3>Clients List</h3>
              <div className="header-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  + Add Client
                </button>
              </div>
            </div>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search client by name, email or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-select"
              />
            </div>

            {filteredClients.length === 0 ? (
              <div className="no-data">
                <p>No clients found.</p>
                {searchQuery && (
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setSearchQuery("")}
                  >
                    Show All
                  </button>
                )}
              </div>
            ) : (
              <DataTable
                columns={["Name", "Email", "Phone Number", "Address", "Registration Date", "Actions"]}
                rows={filteredClients.map((client) => ({
                  Name: client.name || "N/A",
                  Email: client.email || "N/A",
                  "Phone Number": client.phone || "N/A",
                  Address: client.address || "No address",
                  "Registration Date": client.created_at 
                    ? new Date(client.created_at).toLocaleDateString('en-US')
                    : "N/A",
                  Actions: (
                    <div className="client-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => handleEditClient(client)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteClient(client.id, client.name)}
                      >
                        Delete
                      </button>
                    </div>
                  ),
                }))}
              />
            )}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingClient ? "Edit Client" : "Add New Client"}</h3>
              <span className="close-modal" onClick={handleCloseModal}>×</span>
            </div>
            
            <form onSubmit={handleCreateClient}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    required
                    value={newClient.name}
                    onChange={handleInputChange}
                    placeholder="Enter client's full name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    required
                    value={newClient.phone}
                    onChange={handleInputChange}
                    placeholder="+255 ..."
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    required
                    value={newClient.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    Password {editingClient ? "(Leave empty to keep current)" : "*"}
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-control"
                      required={!editingClient} // Required only for new clients
                      value={newClient.password}
                      onChange={handleInputChange}
                      placeholder={editingClient ? "Enter new password (optional)" : "Enter password"}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {editingClient && (
                    <small className="text-muted">
                      Leave password field empty if you don't want to change it
                    </small>
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    name="address"
                    className="form-control"
                    value={newClient.address}
                    onChange={handleInputChange}
                    placeholder="Enter client's complete address"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Processing..." : (editingClient ? "Update Client" : "Register Client")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .password-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-input-container input {
          padding-right: 40px;
          width: 100%;
        }
        .password-toggle {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 5px;
        }
        .text-muted {
          color: #6c757d;
          font-size: 12px;
          margin-top: 5px;
          display: block;
        }
        .client-actions {
          display: flex;
          gap: 8px;
        }
        .btn-danger {
          background-color: #dc3545;
          color: white;
          border: 1px solid #dc3545;
        }
        .btn-danger:hover {
          background-color: #c82333;
          border-color: #bd2130;
        }
      `}</style>
    </div>
  );
};

export default ClientManagement;