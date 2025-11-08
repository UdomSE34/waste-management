import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/client/PageHotel.css";
import hotelService from "../../services/client/hotelService";

const PageHotel = () => {
  const navigate = useNavigate();

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
    client: "", // hidden field
  };

  const [newHotel, setNewHotel] = useState(initialHotelState);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Attach client_id from localStorage
  useEffect(() => {
    const clientId = localStorage.getItem("userId");
    if (!clientId) {
      alert("You must log in to access this page.");
      navigate("/login");
      return;
    }
    setNewHotel((prev) => ({ ...prev, client: clientId }));
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHotel({ ...newHotel, [name]: value });
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleHotelSubmit = async (e) => {
    e.preventDefault();

    try {
      await hotelService.createPendingHotel(newHotel); // POST data
      setSubmitted(true);
      setNewHotel(initialHotelState);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error submitting hotel info:", error.response || error);
      alert(
        error.response?.data?.detail ||
          "Failed to submit hotel information. Please try again."
      );
    }
  };
  if (submitted) {
    return (
      <div className="success-message-client">
        <h2>Hotel Information Submitted Successfully!</h2>
        <p>Your hotel details have been saved to our system.</p>
        <button onClick={() => setSubmitted(false)}>Add Another Hotel</button>
      </div>
    );
  }

  return (
    <div className="dashboard-hotel-form">
      <div className="dashboard-header">
        <br />
        <h1>Customer Registration</h1>
        <p>Register a new hotel for waste management services</p>
        <br />
      </div>

      {/* Progress Steps */}
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
        {/* Hidden client field */}
        <input type="hidden" name="client" value={newHotel.client} />

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="form-section active">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Hotel Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newHotel.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={newHotel.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={newHotel.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Phone:</label>
                <input
                  type="text"
                  name="contact_phone"
                  value={newHotel.contact_phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-navigation">
              <button type="button" onClick={nextStep} className="btn-next">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Hotel Details */}
        {currentStep === 2 && (
          <div className="form-section active">
            <h3>Hotel Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Standard (Hadhi):</label>
                <select
                  name="hadhi"
                  value={newHotel.hadhi}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Standard</option>
                  <option value="economy">Economy</option>
                  <option value="standard">Standard</option>
                  <option value="luxury">Luxury</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="form-group">
                <label>Total Rooms:</label>
                <input
                  type="number"
                  name="total_rooms"
                  value={newHotel.total_rooms}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hotel Type:</label>
                <select
                  name="type"
                  value={newHotel.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="hotel">Hotel</option>
                  <option value="villa">Villa</option>
                  <option value="guest_house">Guest House</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="private_house">Private House</option>
                </select>
              </div>
              <div className="form-group">
                <label>Waste Per Day (kg):</label>
                <input
                  type="number"
                  name="waste_per_day"
                  value={newHotel.waste_per_day}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-navigation">
              <button type="button" onClick={prevStep} className="btn-prev">
                ← Previous
              </button>
              <button type="button" onClick={nextStep} className="btn-next">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Service Details */}
        {currentStep === 3 && (
          <div className="form-section active">
            <h3>Service Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Collection Frequency</label>
                <select
                  name="collection_frequency"
                  value={newHotel.collection_frequency}
                  onChange={handleInputChange}
                  required
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
                <label>Currency</label>
                <select
                  name="currency"
                  value={newHotel.currency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Currency</option>
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
                <label>Payment Account:</label>
                <select
                  name="payment_account"
                  value={newHotel.payment_account}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Payment Method --</option>
                  <option value="account">Account</option>
                  <option value="cash">Cash</option>
                  <option value="phone_number">Phone Number</option>
                </select>
              </div>
            </div>

            <div className="form-navigation">
              <button type="button" onClick={prevStep} className="btn-prev">
                ← Previous
              </button>
              <button type="submit" className="btn-submit">
                Save Information
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PageHotel;
