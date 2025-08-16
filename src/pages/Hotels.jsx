import { useState } from "react";
import DataTable from "../components/DataTable";
import "../css/Hotels.css";

const HotelClients = () => {
  // Sample hotel data
  const [hotels, setHotels] = useState([
    { 
      id: 1, 
      name: "Grand Plaza Hotel", 
      location: "Downtown", 
      contact: "manager@grandplaza.com", 
      phone: "+1 (555) 123-4567",
      contract: "Premium",
      wasteTypes: ["Paper", "Glass", "Organic"],
      collectionsPerWeek: 5,
      lastCollection: "2023-11-07",
      status: "Active"
    },
    { 
      id: 2, 
      name: "Seaside Resort", 
      location: "Beachfront", 
      contact: "info@seasideresort.com", 
      phone: "+1 (555) 234-5678",
      contract: "Standard",
      wasteTypes: ["Glass", "Plastic"],
      collectionsPerWeek: 3,
      lastCollection: "2023-11-06",
      status: "Active"
    },
    { 
      id: 3, 
      name: "Urban Suites", 
      location: "City Center", 
      contact: "admin@urbansuites.com", 
      phone: "+1 (555) 345-6789",
      contract: "Premium",
      wasteTypes: ["Paper", "Organic", "Metal"],
      collectionsPerWeek: 7,
      lastCollection: "2023-11-07",
      status: "Active"
    },
    { 
      id: 4, 
      name: "Mountain Lodge", 
      location: "Alpine Valley", 
      contact: "bookings@mountainlodge.com", 
      phone: "+1 (555) 456-7890",
      contract: "Standard",
      wasteTypes: ["Organic", "Compost"],
      collectionsPerWeek: 2,
      lastCollection: "2023-11-05",
      status: "Pending"
    },
    { 
      id: 5, 
      name: "Riverside Hotel", 
      location: "River District", 
      contact: "contact@riverside.com", 
      phone: "+1 (555) 567-8901",
      contract: "Basic",
      wasteTypes: ["Paper", "General"],
      collectionsPerWeek: 1,
      lastCollection: "2023-11-04",
      status: "Active"
    },
  ]);

  // State for modals
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [showHotelDetails, setShowHotelDetails] = useState(null);
  const [showEditHotel, setShowEditHotel] = useState(null);

  // State for new hotel form
  const [newHotel, setNewHotel] = useState({
    name: "",
    location: "",
    contact: "",
    phone: "",
    contract: "Standard",
    wasteTypes: [],
    collectionsPerWeek: 1,
    status: "Active"
  });

  // Available waste types
  const allWasteTypes = ["Paper", "Glass", "Organic", "Plastic", "Metal", "Compost", "General"];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHotel(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle waste type toggle
  const toggleWasteType = (type) => {
    setNewHotel(prev => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(type)
        ? prev.wasteTypes.filter(t => t !== type)
        : [...prev.wasteTypes, type]
    }));
  };

  // Add new hotel
  const handleAddHotel = (e) => {
    e.preventDefault();
    const hotel = {
      id: hotels.length + 1,
      ...newHotel,
      lastCollection: "Never"
    };
    setHotels([...hotels, hotel]);
    setShowAddHotel(false);
    setNewHotel({
      name: "",
      location: "",
      contact: "",
      phone: "",
      contract: "Standard",
      wasteTypes: [],
      collectionsPerWeek: 1,
      status: "Active"
    });
  };

  // Update hotel
  const handleUpdateHotel = (e) => {
    e.preventDefault();
    setHotels(hotels.map(hotel => 
      hotel.id === showEditHotel.id ? { ...showEditHotel } : hotel
    ));
    setShowEditHotel(null);
  };

  // Status badge classes
  const statusClasses = {
    "Active": "status-active",
    "Pending": "status-pending",
    "Inactive": "status-inactive"
  };

  // Contract type classes
  const contractClasses = {
    "Premium": "contract-premium",
    "Standard": "contract-standard",
    "Basic": "contract-basic"
  };

  return (
    <div className="content">
      <div>
        <h2>Hotels Clients</h2>
        <br />
      </div>
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Active Hotels</h3>
            <span>🏨</span>
          </div>
          <h4>{hotels.filter(h => h.status === "Active").length}</h4>
          <p>Out of {hotels.length} total clients</p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>Premium Clients</h3>
            <span>⭐</span>
          </div>
          <h4>{hotels.filter(h => h.contract === "Premium").length}</h4>
          <p>High-value partnerships</p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>Weekly Collections</h3>
            <span>♻️</span>
          </div>
          <h4>{hotels.reduce((sum, hotel) => sum + hotel.collectionsPerWeek, 0)}</h4>
          <p>Scheduled pickups across all hotels</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Hotel Clients</h3>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddHotel(true)}
          >
            + Add Hotel
          </button>
        </div>
        <DataTable 
          columns={["Name", "Location", "Contract", "Collections/Week", "Waste Types", "Status", "Actions"]} 
          rows={hotels.map(hotel => ({
            Name: hotel.name,
            Location: hotel.location,
            Contract: (
              <span className={`contract-badge ${contractClasses[hotel.contract]}`}>
                {hotel.contract}
              </span>
            ),
            "Collections/Week": hotel.collectionsPerWeek,
            "Waste Types": (
              <div className="waste-types-container">
                {hotel.wasteTypes.map(type => (
                  <span key={type} className="waste-type-badge">
                    {type}
                  </span>
                ))}
              </div>
            ),
            Status: (
              <span className={`status-badge ${statusClasses[hotel.status]}`}>
                {hotel.status}
              </span>
            ),
            Actions: (
              <div className="hotel-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowHotelDetails(hotel)}
                >
                  Details
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowEditHotel(hotel)}
                >
                  Edit
                </button>
              </div>
            )
          }))} 
        />
      </div>

      {/* Add Hotel Modal */}
      {showAddHotel && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Hotel</h3>
              <span className="close-modal" onClick={() => setShowAddHotel(false)}>
                &times;
              </span>
            </div>
            <form onSubmit={handleAddHotel}>
              <div className="form-group">
                <label>Hotel Name</label>
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
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  required
                  value={newHotel.location}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="contact"
                  className="form-control"
                  required
                  value={newHotel.contact}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={newHotel.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Contract Type</label>
                <select
                  name="contract"
                  className="form-control"
                  required
                  value={newHotel.contract}
                  onChange={handleInputChange}
                >
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Collections Per Week</label>
                <input
                  type="number"
                  name="collectionsPerWeek"
                  className="form-control"
                  min="1"
                  max="7"
                  required
                  value={newHotel.collectionsPerWeek}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Waste Types</label>
                <div className="waste-types-selector">
                  {allWasteTypes.map(type => (
                    <button
                      type="button"
                      key={type}
                      className={`waste-type-option ${
                        newHotel.wasteTypes.includes(type) ? 'selected' : ''
                      }`}
                      onClick={() => toggleWasteType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  className="form-control"
                  required
                  value={newHotel.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
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

      {/* Hotel Details Modal */}
      {showHotelDetails && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{showHotelDetails.name} Details</h3>
              <span className="close-modal" onClick={() => setShowHotelDetails(null)}>
                &times;
              </span>
            </div>
            <div className="hotel-details">
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span>{showHotelDetails.location}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact:</span>
                <span>{showHotelDetails.contact}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span>{showHotelDetails.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contract:</span>
                <span className={`contract-badge ${contractClasses[showHotelDetails.contract]}`}>
                  {showHotelDetails.contract}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Collections/Week:</span>
                <span>{showHotelDetails.collectionsPerWeek}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Collection:</span>
                <span>{showHotelDetails.lastCollection}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${statusClasses[showHotelDetails.status]}`}>
                  {showHotelDetails.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Waste Types:</span>
                <div className="waste-types-container">
                  {showHotelDetails.wasteTypes.map(type => (
                    <span key={type} className="waste-type-badge">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hotel Modal */}
      {showEditHotel && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit {showEditHotel.name}</h3>
              <span className="close-modal" onClick={() => setShowEditHotel(null)}>
                &times;
              </span>
            </div>
            <form onSubmit={handleUpdateHotel}>
              <div className="form-group">
                <label>Hotel Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  required
                  value={showEditHotel.name}
                  onChange={(e) => setShowEditHotel({...showEditHotel, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  required
                  value={showEditHotel.location}
                  onChange={(e) => setShowEditHotel({...showEditHotel, location: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="contact"
                  className="form-control"
                  required
                  value={showEditHotel.contact}
                  onChange={(e) => setShowEditHotel({...showEditHotel, contact: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={showEditHotel.phone}
                  onChange={(e) => setShowEditHotel({...showEditHotel, phone: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Contract Type</label>
                <select
                  name="contract"
                  className="form-control"
                  required
                  value={showEditHotel.contract}
                  onChange={(e) => setShowEditHotel({...showEditHotel, contract: e.target.value})}
                >
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Collections Per Week</label>
                <input
                  type="number"
                  name="collectionsPerWeek"
                  className="form-control"
                  min="1"
                  max="7"
                  required
                  value={showEditHotel.collectionsPerWeek}
                  onChange={(e) => setShowEditHotel({...showEditHotel, collectionsPerWeek: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  className="form-control"
                  required
                  value={showEditHotel.status}
                  onChange={(e) => setShowEditHotel({...showEditHotel, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Waste Types</label>
                <div className="waste-types-selector">
                  {allWasteTypes.map(type => (
                    <button
                      type="button"
                      key={type}
                      className={`waste-type-option ${
                        showEditHotel.wasteTypes.includes(type) ? 'selected' : ''
                      }`}
                      onClick={() => {
                        const newTypes = showEditHotel.wasteTypes.includes(type)
                          ? showEditHotel.wasteTypes.filter(t => t !== type)
                          : [...showEditHotel.wasteTypes, type];
                        setShowEditHotel({...showEditHotel, wasteTypes: newTypes});
                      }}
                    >
                      {type}
                    </button>
                  ))}
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
    </div>
  );
};

export default HotelClients;