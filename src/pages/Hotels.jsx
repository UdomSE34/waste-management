import { useState, useEffect } from "react";
import {
  getHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  exportHotels,
} from "../services/hotelServices";
import DataTable from "../components/DataTable";
import "../css/Hotels.css";

const HotelClients = () => {
  // Hotel data state
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters] = useState({});

  // Modal states
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [showEditHotel, setShowEditHotel] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // New hotel form state
  const [newHotel, setNewHotel] = useState({
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
    payment_account: "", // ✅ your state uses payment_account
  });

  // Fetch hotels from API
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        // 🔁 Fetch data from API
        const data = await getHotels(filters);

        console.log("📡 Raw API Response:", data); // 🧪 Debug: Check browser console

        if (!Array.isArray(data)) {
          console.error("❌ API did not return an array. Response:", data);
          setHotels([]);
          setError("Invalid data format from server.");
          setLoading(false);
          return;
        }

        // ✅ Transform backend data to match frontend model
        const transformedHotels = data.map((hotel) => ({
          id: hotel.hotel_id,
          name: hotel.name,
          address: hotel.address,
          email: hotel.email,
          contact_phone: hotel.contact_phone,

          // 🆕 New fields
          hadhi: hotel.hadhi, // Hadhi ya hotel
          total_rooms: hotel.total_rooms, // Idadi ya vyumba
          type: hotel.type, // Villas / Hotel / Guest House / Restaurant
          waste_per_day: hotel.waste_per_day, // Taka kwa siku
          collection_frequency: hotel.collection_frequency, // Mara ngapi wanataka kuchukua taka
          currency: hotel.currency, // USD / TZS
          payment_account: hotel.payment_account, // Account ya kampuni
        }));

        setHotels(transformedHotels);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("🚨 Error fetching hotels:", err);
        setError(err.message || "Failed to load hotel data.");
        setLoading(false);
      }
    };

    fetchHotels();
  }, [filters]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHotel((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add new hotel
  // Add new hotel
  const handleAddHotel = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newHotel.name,
        address: newHotel.address,
        email: newHotel.email,
        contact_phone: newHotel.contact_phone,

        hadhi: newHotel.hadhi,
        total_rooms: newHotel.total_rooms,
        type: newHotel.type,
        waste_per_day: newHotel.waste_per_day,
        collection_frequency: newHotel.collection_frequency,
        currency: newHotel.currency,
        payment_account: newHotel.payment_account, // ✅ fixed
      };

      const createdHotel = await createHotel(payload);

      const transformed = {
        id: createdHotel.hotel_id || createdHotel.id,
        ...createdHotel,
      };

      setHotels([...hotels, transformed]);
      setShowAddHotel(false);

      // reset
      setNewHotel({
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
        payment_account: "", // ✅ fixed
      });
    } catch (err) {
      console.error("Failed to create hotel:", err);
      alert("Create failed: " + (err.message || "Check console"));
    }
  };

  // Update hotel
  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    try {
      // Prepare payload with proper type conversion
      const payload = {
        name: showEditHotel.name,
        address: showEditHotel.address,
        email: showEditHotel.email,
        contact_phone: showEditHotel.contact_phone,
        hadhi: showEditHotel.hadhi,
        total_rooms: Number(showEditHotel.total_rooms) || 0,
        type: showEditHotel.type,
        waste_per_day: Number(showEditHotel.waste_per_day) || 0,
        collection_frequency: showEditHotel.collection_frequency,
        currency: showEditHotel.currency,
        payment_account: showEditHotel.payment_account,
      };

      console.log("Updating hotel payload:", payload);

      // Call API to update hotel
      const updatedHotel = await updateHotel(
        showEditHotel.hotel_id || showEditHotel.id,
        payload
      );

      // Update frontend state using functional update to ensure re-render
      setHotels((prevHotels) =>
        prevHotels.map((hotel) =>
          (hotel.hotel_id || hotel.id) ===
          (updatedHotel.hotel_id || updatedHotel.id)
            ? updatedHotel
            : hotel
        )
      );

      // Close edit modal
      setShowEditHotel(null);
    } catch (err) {
      console.error("Failed to update hotel:", err.response?.data || err);
      alert("Failed to update hotel. Please try again.");
    }
  };

  // Delete hotel
  const handleDeleteHotel = async (id) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      try {
        await deleteHotel(id);
        setHotels(hotels.filter((hotel) => hotel.id !== id));
      } catch (err) {
        console.error("Failed to delete hotel:", err);
        alert("Failed to delete hotel. Please try again.");
      }
    }
  };

  // Export hotels
  const handleExport = async (format) => {
    try {
      const blob = await exportHotels(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hotels.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setShowExportOptions(false);
    } catch (err) {
      console.error("Failed to export hotels:", err);
      alert("Failed to export hotels. Please try again.");
    }
  };

  // Status badge classes

  // Contract type classes

  // // Filter handlers
  // const handleFilterChange = (e) => {
  //   const { name, value } = e.target;
  //   setFilters(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
  // };

  return (
    <div className="content">
      <div className="page-header">
        <h2>Hotel Clients</h2>
      </div>
      <br />

      {loading && <div className="loading-indicator">Loading hotels...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* Filter Section */}
          {/* <div className="filter-section">
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                className="form-control"
                onChange={handleFilterChange}
                value={filters.status || ""}
              >
                <option value="">All Statuses</option>
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Contract Type</label>
              <select
                name="contract"
                className="form-control"
                onChange={handleFilterChange}
                value={filters.contract || ""}
              >
                <option value="">All Contracts</option>
                {contractTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                className="form-control"
                placeholder="Search by name or location"
                onChange={handleFilterChange}
                value={filters.search || ""}
              />
            </div>
          </div> */}

          {/* Stats Cards */}
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-header">
                <h3>Active Hotels</h3>
                <span>
                  <i class="bi bi-house-door"></i>
                </span>
              </div>
              <h4>{hotels.length}</h4>
              <p>Out of {hotels.length} total clients</p>
            </div>
          </div>

          {/* Hotels Table */}
          <div className="card">
            <div className="card-header">
              <h3>Hotel Clients</h3>
              {/* <span className="total-count">{hotels.length} hotels</span> */}
              <div className="header-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddHotel(true)}
                >
                  {" "}
                  <span> </span>+ Add Hotel
                </button>
                &nbsp;
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowExportOptions(true)}
                >
                  Export Data
                </button>
              </div>
            </div>
            <div className="col-ms-12">
              <DataTable
                columns={[
                  "Name",
                  "Address",
                  "Contact",
                  "Email",
                  "Hadhi",
                  "Rooms",
                  "Type",
                  "Waste/Day",
                  "Collection Freq.",
                  "Currency",
                  "Account",

                  "Actions",
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
                  Actions: (
                    <div className="hotel-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => setShowEditHotel({ ...hotel })}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteHotel(hotel.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ),
                }))}
              />
            </div>
          </div>
        </>
      )}

      {/* Add Hotel Modal */}
      {showAddHotel && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Hotel</h3>
              <span
                className="close-modal"
                onClick={() => setShowAddHotel(false)}
              >
                &times;
              </span>
            </div>

            <form onSubmit={handleAddHotel}>
              <div className="form-grid">
                {/* Basic Info */}
                <div className="form-group">
                  <label>Hotel Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    required
                    value={newHotel.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    required
                    value={newHotel.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    required
                    value={newHotel.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    className="form-control"
                    value={newHotel.contact_phone}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Custom Fields */}
                <div className="form-group">
                  <label>Hadhi ya Hotel</label>
                  <input
                    type="text"
                    name="hadhi"
                    className="form-control"
                    value={newHotel.hadhi}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Idadi ya Rooms</label>
                  <input
                    type="number"
                    name="total_rooms"
                    className="form-control"
                    value={newHotel.total_rooms}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Aina ya Hotel</label>
                  <select
                    name="type"
                    className="form-control"
                    value={newHotel.type}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select --</option>
                    <option value="hotel">Hotel</option>
                    <option value="villa">Villa</option>
                    <option value="guest_house">Guest House</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="private_house">Private House</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Taka kwa siku (kg)</label>
                  <input
                    type="number"
                    name="waste_per_day"
                    className="form-control"
                    value={newHotel.waste_per_day}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Collection Frequency */}
                <div className="form-group">
                  <label>Mara ngapi kuchukuliwa</label>
                  <select
                    name="collection_frequency"
                    className="form-control"
                    value={newHotel.collection_frequency}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Chagua --</option>

                    {/* Weekly options */}
                    <option value="1">Mara kwa wiki - 1 mara</option>
                    <option value="2">Mara kwa wiki - 2 mara</option>
                    <option value="3">Mara kwa wiki - 3 mara</option>
                    <option value="4">Mara kwa wiki - 4 mara</option>
                    <option value="5">Mara kwa wiki - 5 mara</option>
                    <option value="6">Mara kwa wiki - 6 mara</option>
                    <option value="7">Daily</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Currency</label>
                  <select
                    name="currency"
                    value={newHotel.currency}
                    onChange={handleInputChange}
                    required
                    className="form-control"
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

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddHotel(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Hotel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditHotel && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit {showEditHotel.name}</h3>
              <span
                className="close-modal"
                onClick={() => setShowEditHotel(null)}
              >
                &times;
              </span>
            </div>
            <form onSubmit={handleUpdateHotel}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Hotel Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    required
                    value={showEditHotel.name || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    required
                    value={showEditHotel.address || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    required
                    value={showEditHotel.email || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    className="form-control"
                    value={showEditHotel.contact_phone || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        contact_phone: e.target.value,
                      })
                    }
                  />
                </div>

                {/* New fields */}
                <div className="form-group">
                  <label>Hadhi ya Hotel</label>
                  <input
                    type="text"
                    name="hadhi"
                    className="form-control"
                    value={showEditHotel.hadhi || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        hadhi: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Idadi ya Rooms</label>
                  <input
                    type="number"
                    name="total_rooms"
                    className="form-control"
                    value={showEditHotel.total_rooms || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        total_rooms: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Type (Villas, Hotel, Guest House, Restaurant)</label>
                  <input
                    type="text"
                    name="type"
                    className="form-control"
                    value={showEditHotel.type || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        type: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Waste Produced Per Day (kg)</label>
                  <input
                    type="number"
                    name="waste_per_day"
                    className="form-control"
                    value={showEditHotel.waste_per_day || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        waste_per_day: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Collection Frequency (per week/day)</label>
                  <input
                    type="text"
                    name="collection_frequency"
                    className="form-control"
                    value={showEditHotel.collection_frequency || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        collection_frequency: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Currency (USD/TZS)</label>
                  <input
                    type="text"
                    name="currency"
                    className="form-control"
                    value={showEditHotel.currency || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        currency: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Payment Account (Company)</label>
                  <input
                    type="text"
                    name="payment_account"
                    className="form-control"
                    value={showEditHotel.payment_account || ""}
                    onChange={(e) =>
                      setShowEditHotel({
                        ...showEditHotel,
                        payment_account: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEditHotel(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Export Hotel Data</h3>
              <span
                className="close-modal"
                onClick={() => setShowExportOptions(false)}
              >
                &times;
              </span>
            </div>
            <div className="export-options">
              <p>Select export format:</p>
              <div className="export-buttons">
                <button
                  className="btn btn-outline"
                  onClick={() => handleExport("csv")}
                >
                  CSV
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleExport("xlsx")}
                >
                  Excel
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleExport("pdf")}
                >
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelClients;
