import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/client/PageHotel.css";
import hotelService from "../../services/client/hotelService";

const PageHotel = () => {
  const navigate = useNavigate();

  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isExistingClient, setIsExistingClient] = useState(null);
  const [unclaimedHotels, setUnclaimedHotels] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

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

  // 🔥 Load unclaimed hotels
  const loadUnclaimedHotels = async () => {
    setLoading(true);
    try {
      const hotels = await hotelService.getUnclaimedHotels();
      console.log("✅ UNCLAIMED HOTELS:", hotels);
      setUnclaimedHotels(hotels || []);
    } catch (error) {
      console.error("❌ Error fetching unclaimed hotels:", error);
      alert("Hitilafu ya kupakua orodha ya hoteli.");
      setUnclaimedHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClientTypeSelect = async (isExisting) => {
    setIsExistingClient(isExisting);
    if (isExisting) {
      await loadUnclaimedHotels();
      setShowClaimModal(true);
    } else {
      setOnboardingStep(3);
    }
  };

  const handleHotelSelect = (hotelId) => {
    setSelectedHotels((prev) =>
      prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const handleClaimHotels = async () => {
    if (selectedHotels.length === 0) {
      alert("Chagua angalau hoteli moja!");
      return;
    }
    setLoading(true);
    try {
      const clientId = localStorage.getItem("userId");
      const response = await hotelService.claimHotels(clientId, selectedHotels);
      alert(`✅ ${response.message}`);
      setShowClaimModal(false);
      setSelectedHotels([]);
      navigate("/client/hotels");
    } catch (error) {
      console.error("❌ Claiming error:", error);
      alert(
        error.response?.data?.detail ||
          "Hitilafu imetokea. Tafadhali jaribu tena."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowClaimModal(false);
    setSelectedHotels([]);
    setOnboardingStep(3);
  };

  const handleBackToQuestion = () => {
    setOnboardingStep(1);
    setIsExistingClient(null);
    setSelectedHotels([]);
    setUnclaimedHotels([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHotel({ ...newHotel, [name]: value });
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    try {
      await hotelService.createPendingHotel(newHotel);
      setSubmitted(true);
      setNewHotel(initialHotelState);
      setCurrentStep(1);
    } catch (error) {
      console.error("❌ Error submitting hotel info:", error.response || error);
      alert(
        error.response?.data?.detail || "Failed to submit hotel information."
      );
    }
  };

  if (submitted) {
    return (
      <div className="success-message-client">
        <h2>Hotel Information Submitted Successfully!</h2>
        <p>Your hotel details have been submitted for approval.</p>
        <button
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
          <h1>Karibu! Tupe Taarifa Kidogo</h1>
          <p>Je, wewe ni nani kwenye mfumo wetu?</p>
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
          >
            👍 Nipo tayari kwenye mfumo
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleClientTypeSelect(false)}
          >
            🆕 Mimi ni mpya
          </button>
        </div>

        {/* 🔥 Modal for claiming hotels */}
        {showClaimModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Chagua Hoteli Zako</h2>
                <button className="modal-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                {loading ? (
                  <div className="loading-message">
                    Inapakua orodha ya hoteli...
                  </div>
                ) : unclaimedHotels.length > 0 ? (
                  <div className="hotels-selection">
                    {unclaimedHotels.map((hotel) => (
                      <div
                        key={hotel.hotel_id}
                        className="hotel-selection-item"
                      >
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedHotels.includes(hotel.hotel_id)}
                            onChange={() => handleHotelSelect(hotel.hotel_id)}
                          />
                          <span>
                            {hotel.name} ({hotel.address || "No address"})
                          </span>
                        </label>
                      </div>
                    ))}
                    <div className="modal-actions">
                      <button
                        className="btn btn-success"
                        onClick={handleClaimHotels}
                        disabled={loading || selectedHotels.length === 0}
                      >
                        {loading
                          ? "Inaendesha..."
                          : `Thibitisha Kudai (${selectedHotels.length})`}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={handleCloseModal}
                      >
                        Sajili Hotel Mpya
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-hotels-modal">
                    <p style={{ textAlign: "center", color: "#666" }}>
                      ❌ Hakuna hoteli zilizopatikana.
                    </p>
                    <button className="btn btn-outline" onClick={handleCloseModal}>
                      Sajili Hotel Mpya
                    </button>
                  </div>
                )}
              </div>
            </div>
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
        <h1>Customer Registration</h1>
        <p>Register a new hotel for waste management services</p>
        <br />
      </div>

      <button
        className="btn btn-outline-secondary"
        onClick={handleBackToQuestion}
      >
        ← Rudi kwenye Maswali
      </button>

      <div className="form-progress dashboard-progress">
        <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
          <span>1</span>
          <label>Basic Info</label>
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
      >
        <input type="hidden" name="client" value={newHotel.client} />

        {currentStep === 1 && (
          <div className="form-section active">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={newHotel.name}
                  onChange={handleInputChange}
                  placeholder="Hotel Name"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="address"
                  value={newHotel.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={newHotel.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="contact_phone"
                  value={newHotel.contact_phone}
                  onChange={handleInputChange}
                  placeholder="Contact Phone"
                  required
                />
              </div>
            </div>
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next →
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-section active">
            <h3>Hotel Details</h3>
            <div className="form-row">
              <div className="form-group">
                <select
                  name="hadhi"
                  value={newHotel.hadhi}
                  onChange={handleInputChange}
                  
                >
                  <option value="">Select Standard</option>
                  <option value="economy">Economy</option>
                  <option value="standard">Standard</option>
                  <option value="luxury">Luxury</option>
                  <option value="premium">Premium</option>
                  
                </select>
              </div>

              <div className="form-group">
                <input
                  type="number"
                  name="total_rooms"
                  value={newHotel.total_rooms}
                  onChange={handleInputChange}
                  placeholder="Total Rooms"
                  
                />
              </div>

              <div className="form-group">
                <select
                  name="type"
                  value={newHotel.type}
                  onChange={handleInputChange}
                  
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
                <input
                  type="number"
                  name="waste_per_day"
                  value={newHotel.waste_per_day}
                  onChange={handleInputChange}
                  placeholder="Waste Per Day (kg)"
                  
                />
              </div>
            </div>
            <button type="button" className="btn btn-outline" onClick={prevStep}>
              ← Previous
            </button>
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next →
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-section active">
            <h3>Service Details</h3>
            <div className="form-row">
              <div className="form-group">
                <select
                  name="collection_frequency"
                  value={newHotel.collection_frequency}
                  onChange={handleInputChange}
                  
                >
                  <option value="">-- Select --</option>
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
                <select
                  name="currency"
                  value={newHotel.currency}
                  onChange={handleInputChange}
                 
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
                <select
                  name="payment_account"
                  value={newHotel.payment_account}
                  onChange={handleInputChange}
                  
                >
                  <option value="">-- Select Payment Method --</option>
                  <option value="account">Account</option>
                  <option value="cash">Cash</option>
                  <option value="phone_number">Phone Number</option>
                </select>
              </div>
            </div>
            <button type="button" className="btn btn-outline" onClick={prevStep}>
              ← Previous
            </button>
            <button type="submit">Save Information</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PageHotel;
