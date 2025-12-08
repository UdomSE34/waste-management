import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/client/PageHotel.css";
import hotelService from "../../services/client/hotelService";

const PageHotel = () => {
  const navigate = useNavigate();

  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isExistingClient, setIsExistingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const initialHotelState = {
    name: "",
    address: "",
    email: "",
    contact_phone: "",
    hadhi: "",
    total_rooms: "",
    type: "",
    waste_per_day: "",
    collection_frequency: "",
    currency: "",
    payment_account: "",
    client: "",
  };

  const [newHotel, setNewHotel] = useState(initialHotelState);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const clientId = localStorage.getItem("userId");
    if (!clientId) {
      alert("You must log in to access this page.");
      navigate("/login");
      return;
    }
    setNewHotel((prev) => ({ ...prev, client: clientId }));
  }, [navigate]);

  // 🔍 Search for hotels by name
  const searchHotels = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter the hotel name you are looking for");
      return;
    }

    setSearchLoading(true);
    setSearchResults([]);
    setShowSearchResults(false);
    
    try {
      const results = await hotelService.getUnclaimedHotels(searchQuery);
      console.log("🔍 SEARCH RESULTS:", results);
      setSearchResults(results || []);
      setShowSearchResults(true);
      
      if (results.length === 0) {
        alert(`No hotels found for "${searchQuery}". Try a different name.`);
      }
    } catch (error) {
      console.error("❌ Error searching hotels:", error);
      alert("Error searching for hotels. Please try again.");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClientTypeSelect = async (isExisting) => {
    setIsExistingClient(isExisting);
    if (isExisting) {
      setShowClaimModal(true);
    } else {
      setOnboardingStep(3);
    }
  };

  const handleHotelSelect = (hotelId, hotelName) => {
    setSelectedHotels((prev) => {
      if (prev.includes(hotelId)) {
        alert(`✋ Removed: ${hotelName}`);
        return prev.filter((id) => id !== hotelId);
      } else {
        if (prev.length >= 10) {
          alert("You can only claim up to 10 hotels at once!");
          return prev;
        }
        alert(`✅ Selected: ${hotelName}`);
        return [...prev, hotelId];
      }
    });
  };

  const handleClaimHotels = async () => {
    if (selectedHotels.length === 0) {
      alert("Please select at least one hotel before claiming!");
      return;
    }
    
    const confirmation = window.confirm(
      `Are you sure you want to claim ${selectedHotels.length} hotel(s)?\n\n` +
      "If you agree, these hotels will be added to your account."
    );
    
    if (!confirmation) return;

    setLoading(true);
    try {
      const clientId = localStorage.getItem("userId");
      const response = await hotelService.claimHotels(clientId, selectedHotels);
      alert(`✅ ${response.message}\n\n${selectedHotels.length} hotel(s) have been successfully added.`);
      setShowClaimModal(false);
      setSelectedHotels([]);
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
      navigate("/client/hotels");
    } catch (error) {
      console.error("❌ Claiming error:", error);
      alert(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowClaimModal(false);
    setSelectedHotels([]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setOnboardingStep(3);
  };

  const handleBackToQuestion = () => {
    setOnboardingStep(1);
    setIsExistingClient(null);
    setSelectedHotels([]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHotel({ ...newHotel, [name]: value });
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await hotelService.createPendingHotel(newHotel);
      setSubmitted(true);
      setNewHotel(initialHotelState);
      setCurrentStep(1);
    } catch (error) {
      console.error("❌ Error submitting hotel info:", error.response || error);
      alert(
        error.response?.data?.detail || 
        error.response?.data?.message ||
        "Failed to submit hotel information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  if (submitted) {
    return (
      <div className="success-message-client">
        <h2>✅ Hotel Information Submitted Successfully!</h2>
        <p>Your hotel details have been submitted for review.</p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSubmitted(false);
            setOnboardingStep(1);
          }}
        >
          Add Another Hotel
        </button>
      </div>
    );
  }

  // 🔥 Onboarding Step 1
  if (onboardingStep === 1) {
    return (
      <div className="dashboard-hotel-form">
        <div className="dashboard-header">
          <br />
          <h1>Welcome! Please Tell Us More</h1>
          <p>Who are you in our system?</p>
          <br />
        </div>

        <div
          className="onboarding-questions"
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => handleClientTypeSelect(true)}
            style={{ padding: "12px 24px", fontSize: "16px" }}
          >
            👍 I'm Already in the System
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleClientTypeSelect(false)}
            style={{ padding: "12px 24px", fontSize: "16px" }}
          >
            🆕 I'm New Here
          </button>
        </div>

        {/* 🔥 Modal for claiming hotels with SEARCH */}
        {showClaimModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "700px", width: "90%" }}>
              <div className="modal-header">
                <h2>🔍 Search and Claim Your Hotels</h2>
                <button className="modal-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              
              <div className="modal-body" style={{ padding: "20px" }}>
                <div className="search-container" style={{ marginBottom: "25px" }}>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter the hotel name you're looking for..."
                      style={{ 
                        flex: 1, 
                        padding: "12px 15px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        fontSize: "16px"
                      }}
                      onKeyPress={(e) => e.key === "Enter" && searchHotels()}
                    />
                    <button 
                      className="btn btn-primary" 
                      onClick={searchHotels}
                      disabled={searchLoading}
                      style={{ padding: "12px 20px" }}
                    >
                      {searchLoading ? "🔍 Searching..." : "Search"}
                    </button>
                    {searchQuery && (
                      <button 
                        className="btn btn-outline" 
                        onClick={clearSearch}
                        style={{ padding: "12px 15px" }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
                    Enter the full hotel name or part of the name (e.g., "Serena", "Kilimanjaro")
                  </small>
                </div>

                {searchLoading ? (
                  <div className="loading-message" style={{ 
                    textAlign: "center", 
                    padding: "40px",
                    color: "#666"
                  }}>
                    <div className="spinner" style={{ 
                      width: "40px", 
                      height: "40px", 
                      border: "4px solid #f3f3f3",
                      borderTop: "4px solid #007bff",
                      borderRadius: "50%",
                      margin: "0 auto 15px",
                      animation: "spin 1s linear infinite"
                    }}></div>
                    <p>Searching for hotels...</p>
                  </div>
                ) : showSearchResults ? (
                  <>
                    {searchResults.length > 0 ? (
                      <div className="hotels-search-results">
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          marginBottom: "15px",
                          padding: "10px 0",
                          borderBottom: "2px solid #eee"
                        }}>
                          <h4 style={{ margin: 0, color: "#333" }}>
                            Search Results: <span style={{ color: "#007bff" }}>{searchResults.length}</span>
                          </h4>
                          <span style={{ 
                            fontSize: "14px", 
                            color: selectedHotels.length > 0 ? "#28a745" : "#666",
                            fontWeight: "bold",
                            backgroundColor: selectedHotels.length > 0 ? "#e8f5e9" : "#f8f9fa",
                            padding: "5px 12px",
                            borderRadius: "20px"
                          }}>
                            📍 Selected: {selectedHotels.length}
                          </span>
                        </div>
                        
                        <div style={{ 
                          maxHeight: "350px", 
                          overflowY: "auto",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          padding: "10px",
                          backgroundColor: "#fafafa"
                        }}>
                          {searchResults.map((hotel, index) => (
                            <div
                              key={hotel.hotel_id || index}
                              className="hotel-search-item"
                              style={{
                                padding: "15px",
                                borderBottom: "1px solid #eee",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                                backgroundColor: selectedHotels.includes(hotel.hotel_id) 
                                  ? "#e8f4ff" 
                                  : "white",
                                transition: "all 0.2s ease",
                                borderRadius: "5px",
                                marginBottom: "8px"
                              }}
                              onClick={() => handleHotelSelect(hotel.hotel_id, hotel.name)}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedHotels.includes(hotel.hotel_id) ? "#d4e8ff" : "#f5f5f5"}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedHotels.includes(hotel.hotel_id) ? "#e8f4ff" : "white"}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center",
                                  marginBottom: "5px"
                                }}>
                                  <strong style={{ 
                                    fontSize: "16px", 
                                    color: "#333",
                                    marginRight: "10px"
                                  }}>
                                    {hotel.name}
                                  </strong>
                                  <span style={{
                                    fontSize: "12px",
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    padding: "2px 8px",
                                    borderRadius: "10px"
                                  }}>
                                    #{hotel.hotel_id}
                                  </span>
                                </div>
                                <div style={{ 
                                  fontSize: "14px", 
                                  color: "#666",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px"
                                }}>
                                  <span>📍 {hotel.address || "No specific address"}</span>
                                </div>
                              </div>
                              <div>
                                <input
                                  type="checkbox"
                                  checked={selectedHotels.includes(hotel.hotel_id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleHotelSelect(hotel.hotel_id, hotel.name);
                                  }}
                                  style={{ 
                                    transform: "scale(1.5)",
                                    cursor: "pointer"
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div style={{ 
                          marginTop: "20px", 
                          fontSize: "14px", 
                          color: "#666",
                          textAlign: "center"
                        }}>
                          <p>⚠️ <strong>Note:</strong> Please verify that the hotel you select is yours before claiming.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="no-results" style={{ 
                        textAlign: "center", 
                        padding: "40px 20px",
                        color: "#666",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "8px",
                        marginTop: "10px"
                      }}>
                        <div style={{ fontSize: "48px", marginBottom: "15px", color: "#dc3545" }}>🔍</div>
                        <h4 style={{ color: "#333", marginBottom: "10px" }}>No Results Found</h4>
                        <p style={{ fontSize: "16px", marginBottom: "20px" }}>
                          No hotels found for: <strong style={{ color: "#007bff" }}>"{searchQuery}"</strong>
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                          <button 
                            className="btn btn-outline" 
                            onClick={clearSearch}
                            style={{ padding: "10px 20px" }}
                          >
                            Try Again
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => {
                              setShowClaimModal(false);
                              setOnboardingStep(3);
                            }}
                            style={{ padding: "10px 20px" }}
                          >
                            Register New Hotel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="search-instructions" style={{ 
                    textAlign: "center", 
                    padding: "40px 20px",
                    color: "#666",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px"
                  }}>
                    <div style={{ fontSize: "48px", marginBottom: "20px", color: "#007bff" }}>🔎</div>
                    <h4 style={{ color: "#333", marginBottom: "15px" }}>How to Search for Hotels</h4>
                    <p style={{ fontSize: "16px", lineHeight: "1.6", maxWidth: "500px", margin: "0 auto 25px" }}>
                      1. Enter the hotel name you're looking for in the search box<br/>
                      2. Click the "Search" button<br/>
                      3. Select hotels from the search results<br/>
                      4. Click "Confirm Claim" to add hotels to your account
                    </p>
                    <div style={{ 
                      padding: "15px", 
                      backgroundColor: "#e8f4ff", 
                      borderRadius: "5px",
                      marginTop: "20px",
                      fontSize: "14px"
                    }}>
                      <strong>💡 Tip:</strong> Use the full hotel name for better search results
                    </div>
                  </div>
                )}

                {selectedHotels.length > 0 && (
                  <div className="selected-summary" style={{
                    marginTop: "25px",
                    padding: "20px",
                    backgroundColor: "#e8f5e9",
                    borderRadius: "8px",
                    border: "1px solid #c3e6cb"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px"
                    }}>
                      <h5 style={{ 
                        margin: 0, 
                        color: "#155724",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}>
                        <span style={{ 
                          backgroundColor: "#28a745",
                          color: "white",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px"
                        }}>
                          {selectedHotels.length}
                        </span>
                        <strong>Hotels Selected:</strong>
                      </h5>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to remove all selected hotels?")) {
                            setSelectedHotels([]);
                            alert("All selections have been removed.");
                          }
                        }}
                        style={{ padding: "8px 15px", fontSize: "14px" }}
                      >
                        Remove All
                      </button>
                    </div>
                    
                    <div className="modal-actions" style={{ 
                      display: "flex", 
                      gap: "15px",
                      marginTop: "15px"
                    }}>
                      <button
                        className="btn btn-success"
                        onClick={handleClaimHotels}
                        disabled={loading}
                        style={{ 
                          flex: 1, 
                          padding: "12px",
                          fontSize: "16px",
                          fontWeight: "bold"
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner" style={{
                              display: "inline-block",
                              width: "16px",
                              height: "16px",
                              border: "2px solid #fff",
                              borderTop: "2px solid transparent",
                              borderRadius: "50%",
                              marginRight: "8px",
                              animation: "spin 1s linear infinite"
                            }}></span>
                            Processing...
                          </>
                        ) : `✅ Confirm Claim (${selectedHotels.length})`}
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={clearSearch}
                        style={{ padding: "12px 20px" }}
                      >
                        🔄 Search More
                      </button>
                    </div>
                  </div>
                )}

                <div className="modal-footer" style={{ 
                  marginTop: "25px", 
                  paddingTop: "20px",
                  borderTop: "1px solid #ddd",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleCloseModal}
                    style={{ padding: "10px 20px" }}
                  >
                    🆕 Register New Hotel
                  </button>
                  <small style={{ 
                    color: "#666", 
                    fontSize: "13px",
                    textAlign: "right",
                    maxWidth: "300px"
                  }}>
                    <strong>Note:</strong> You can claim up to 10 hotels at once.<br/>
                    Once claimed, hotels will be linked to your account.
                  </small>
                </div>
              </div>
            </div>
            
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
    );
  }

  // 🔥 Registration form for new hotel
  return (
    <div className="dashboard-hotel-form">
      <div className="dashboard-header">
        <br />
        <h1>New Customer Registration</h1>
        <p>Register a new customer for waste management services</p>
        <br />
      </div>

      <button
        className="btn btn-outline-secondary"
        onClick={handleBackToQuestion}
        style={{ marginBottom: "30px" }}
      >
        ← Back to Questions
      </button>

      <div className="form-progress dashboard-progress">
        <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
          <span>1</span>
          <label>Basic Information</label>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
          <span>2</span>
          <label>Hotel Details</label>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
          <span>3</span>
          <label>Service Details</label>
        </div>
      </div>

      <form
        onSubmit={handleHotelSubmit}
        className="dashboard-hotel-form-content"
        style={{ marginTop: "30px" }}
      >
        <input type="hidden" name="client" value={newHotel.client} />

        {currentStep === 1 && (
          <div className="form-section active">
            <h3 style={{ color: "#333", marginBottom: "25px" }}>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label> Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newHotel.name}
                  onChange={handleInputChange}
                  placeholder="Enter full hotel name"
                  required
                  style={{ padding: "12px 15px" }}
                />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={newHotel.address}
                  onChange={handleInputChange}
                  placeholder="Complete hotel address"
                  required
                  style={{ padding: "12px 15px" }}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={newHotel.email}
                  onChange={handleInputChange}
                  placeholder="hotel@example.com"
                  required
                  style={{ padding: "12px 15px" }}
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  name="contact_phone"
                  value={newHotel.contact_phone}
                  onChange={handleInputChange}
                  placeholder="+255 XXX XXX XXX"
                  required
                  style={{ padding: "12px 15px" }}
                />
              </div>
            </div>
            <div style={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #eee"
            }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={nextStep}
                style={{ padding: "12px 30px", fontSize: "16px" }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-section active">
            <h3 style={{ color: "#333", marginBottom: "25px" }}> Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label> Standard *</label>
                <select
                  name="hadhi"
                  value={newHotel.hadhi}
                  onChange={handleInputChange}
                  required
                  style={{ padding: "12px 15px", width: "100%" }}
                >
                  <option value="">Select Standard</option>
                  <option value="economy">Economy</option>
                  <option value="standard">Standard</option>
                  <option value="luxury">Luxury</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Rooms *</label>
                <input
                  type="number"
                  name="total_rooms"
                  value={newHotel.total_rooms}
                  onChange={handleInputChange}
                  placeholder="Enter total number of rooms"
                  required
                  style={{ padding: "12px 15px" }}
                />
              </div>

              <div className="form-group">
                <label>Property Type *</label>
                <select
                  name="type"
                  value={newHotel.type}
                  onChange={handleInputChange}
                  required
                  style={{ padding: "12px 15px", width: "100%" }}
                >
                  <option value="">Select Type</option>
                  <option value="hotel">Hotel</option>
                  <option value="villa">Villa</option>
                  <option value="guest_house">Guest House</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="private_house">Private House</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label>Daily Waste (kg) *</label>
                <input
                  type="number"
                  name="waste_per_day"
                  value={newHotel.waste_per_day}
                  onChange={handleInputChange}
                  placeholder="Estimated daily waste in kg"
                  required
                  style={{ padding: "12px 15px" }}
                />
              </div>
            </div>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #eee"
            }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={prevStep}
                style={{ padding: "12px 30px", fontSize: "16px" }}
              >
                ← Previous
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={nextStep}
                style={{ padding: "12px 30px", fontSize: "16px" }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-section active">
            <h3 style={{ color: "#333", marginBottom: "25px" }}>Service Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Collection Frequency *</label>
                <select
                  name="collection_frequency"
                  value={newHotel.collection_frequency}
                  onChange={handleInputChange}
                  required
                  style={{ padding: "12px 15px", width: "100%" }}
                >
                  <option value="">Select Collection Frequency</option>
                  <option value="daily">Daily</option>
                  <option value="1">Once per week</option>
                  <option value="2">Twice per week</option>
                  <option value="3">Three times per week</option>
                  <option value="4">Four times per week</option>
                  <option value="5">Five times per week</option>
                  <option value="6">Six times per week</option>
                  <option value="7">Seven times per week</option>
                </select>
              </div>

              <div className="form-group">
                <label>Currency *</label>
                <select
                  name="currency"
                  value={newHotel.currency}
                  onChange={handleInputChange}
                  required
                  style={{ padding: "12px 15px", width: "100%" }}
                >
                  <option value="">Select Currency</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="TZS">TZS (TSh)</option>
                  <option value="KES">KES (KSh)</option>
                  <option value="UGX">UGX (USh)</option>
                  <option value="ZAR">ZAR (R)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CHF">CHF (Fr)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="NZD">NZD (NZ$)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  name="payment_account"
                  value={newHotel.payment_account}
                  onChange={handleInputChange}
                  required
                  style={{ padding: "12px 15px", width: "100%" }}
                >
                  <option value="">Select Payment Method</option>
                  <option value="account">Bank Account</option>
                  <option value="cash">Cash</option>
                  <option value="phone_number">Mobile Phone Number</option>
                </select>
              </div>
            </div>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #eee"
            }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={prevStep}
                style={{ padding: "12px 30px", fontSize: "16px" }}
              >
                ← Previous
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: "12px 30px", fontSize: "16px" }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      border: "2px solid #fff",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      marginRight: "8px",
                      animation: "spin 1s linear infinite"
                    }}></span>
                    Submitting...
                  </>
                ) : "Save Information"}
              </button>
            </div>
          </div>
        )}
      </form>

      <style jsx>{`
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #fff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PageHotel;