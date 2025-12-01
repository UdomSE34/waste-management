import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clientService from "../../services/client/clientProfile";

const ClientProfile = () => {
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Check authentication and load client data
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      navigate("/login");
      return;
    }

    loadClientProfile();
  }, [navigate]);

  // Load client profile - using client-specific endpoints
  const loadClientProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use getMyProfile instead of getClient - no clientId needed
      const response = await clientService.getMyProfile();
      console.log("📡 Client profile response:", response);
      
      setClient(response);
      setProfileData({
        name: response.name || "",
        phone: response.phone || "",
        email: response.email || "",
        address: response.address || "",
      });
      
    } catch (error) {
      console.error("❌ Error loading client profile:", error);
      
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(error.message || "Failed to load profile information.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle profile input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  // Update profile information - using client-specific endpoint
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      // Use updateMyProfile instead of updateClient - no clientId needed
      await clientService.updateMyProfile(profileData);
      
      setSuccess("Profile updated successfully!");
      
      // Reload client data to get updated information
      setTimeout(() => {
        loadClientProfile();
      }, 1000);
      
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.detail || 
                           error.response?.data?.error ||
                           "Failed to update profile. Please try again.";
        setError(errorMessage);
      }
    } finally {
      setUpdating(false);
    }
  };

  // Change password - using dedicated password change endpoint
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords do not match.");
      setUpdating(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError("New password must be at least 6 characters long.");
      setUpdating(false);
      return;
    }

    try {
      // Use changeMyPassword instead of updateClient
      await clientService.changeMyPassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });
      
      setSuccess("Password changed successfully!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      
    } catch (error) {
      console.error("❌ Error changing password:", error);
      
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.detail ||
                           "Current password is incorrect.";
        setError(errorMessage);
      } else {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.detail || 
                           error.response?.data?.error ||
                           "Failed to change password. Please try again.";
        setError(errorMessage);
      }
    } finally {
      setUpdating(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <div className="content">
        <div className="loading-indicator">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <h2>My Profile</h2>
        
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
          <div style={{ marginTop: '10px' }}>
            <button className="btn btn-primary" onClick={loadClientProfile}>
              Try Again
            </button>
            {error.includes("Session expired") && (
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate("/login")}
                style={{ marginLeft: '10px' }}
              >
                Login Again
              </button>
            )}
          </div>
        </div>
      )}

      {success && (
        <div className="success-message">
          ✅ {success}
        </div>
      )}

      {client && (
        <div className="profile-container">
          {/* Profile Overview Card */}
          <div className="card">
            <div className="card-header">
              <h3>Profile Overview</h3>
            </div>
            <div className="profile-overview">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  {client.name ? client.name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
              <div className="profile-info">
                <h4>{client.name}</h4>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Phone:</strong> {client.phone}</p>
                <p><strong>Client ID:</strong> {client.client_id}</p>
                <p><strong>Member since:</strong> {client.created_at ? new Date(client.created_at).toLocaleDateString('en-US') : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Tabs for Profile and Password */}
          <div className="card">
            <div className="tabs">
              <button 
                className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Edit Profile
              </button>
              <button 
                className={`tab-button ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                Change Password
              </button>
            </div>

            {/* Profile Edit Form */}
            {activeTab === "profile" && (
              <div className="tab-content">
                <h4>Update Your Information</h4>
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        required
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        required
                        value={profileData.phone}
                        onChange={handleProfileChange}
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
                        value={profileData.email}
                        onChange={handleProfileChange}
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Address</label>
                      <textarea
                        name="address"
                        className="form-control"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        placeholder="Enter your complete address"
                        rows="3"
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={updating}
                    >
                      {updating ? "Updating..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Change Form */}
            {activeTab === "password" && (
              <div className="tab-content">
                <h4>Change Your Password</h4>
                <form onSubmit={handleChangePassword}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Current Password *</label>
                      <div className="password-input-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="current_password"
                          className="form-control"
                          required
                          value={passwordData.current_password}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>New Password *</label>
                      <div className="password-input-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="new_password"
                          className="form-control"
                          required
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          minLength="6"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      <small className="text-muted">
                        Password must be at least 6 characters long
                      </small>
                    </div>
                    
                    <div className="form-group">
                      <label>Confirm New Password *</label>
                      <div className="password-input-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirm_password"
                          className="form-control"
                          required
                          value={passwordData.confirm_password}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          minLength="6"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={updating}
                    >
                      {updating ? "Changing Password..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .profile-overview {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
        }
        
        .avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
        }
        
        .profile-info h4 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .profile-info p {
          margin: 5px 0;
          color: #666;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
        }
        
        .tab-button {
          padding: 12px 24px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          transition: all 0.3s ease;
        }
        
        .tab-button.active {
          color: #007bff;
          border-bottom-color: #007bff;
          font-weight: bold;
        }
        
        .tab-button:hover {
          color: #0056b3;
        }
        
        .tab-content {
          padding: 0 20px 20px;
        }
        
        .tab-content h4 {
          margin-bottom: 20px;
          color: #333;
        }
        
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
        
        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #c3e6cb;
        }
        
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .profile-overview {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ClientProfile;