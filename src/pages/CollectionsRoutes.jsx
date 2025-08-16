import { useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
import DataTable from "../components/DataTable";
import "../css/Routes.css";

// Fix for default marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });

const CollectionRoutes = () => {
  // Sample route data with coordinates
  const [routes, setRoutes] = useState([
    {
      id: 1,
      name: "Downtown Loop",
      team: "Team Green",
      day: "Monday",
      hotels: ["Grand Plaza Hotel", "Urban Suites"],
      distance: "12.5 km",
      duration: "3.5 hours",
      status: "Active",
      coordinates: [
        [51.505, -0.09],  // Starting point
        [51.51, -0.1],     // Grand Plaza Hotel
        [51.515, -0.1],    // Urban Suites
        [51.52, -0.12]     // Ending point
      ]
    },
    {
      id: 2,
      name: "Beachfront Route",
      team: "Team Blue",
      day: "Wednesday",
      hotels: ["Seaside Resort", "Harbor View"],
      distance: "18.2 km",
      duration: "4.2 hours",
      status: "Active",
      coordinates: [
        [51.5, -0.08],    // Starting point
        [51.49, -0.07],   // Seaside Resort
        [51.48, -0.06],    // Harbor View
        [51.47, -0.05]     // Ending point
      ]
    },
    {
      id: 3,
      name: "Weekend Special",
      team: "Team Red",
      day: "Saturday",
      hotels: ["Mountain Lodge", "Riverside Hotel"],
      distance: "22.7 km",
      duration: "5.1 hours",
      status: "Inactive",
      coordinates: [
        [51.53, -0.11],   // Starting point
        [51.54, -0.12],   // Mountain Lodge
        [51.55, -0.13],   // Riverside Hotel
        [51.56, -0.14]    // Ending point
      ]
    }
  ]);

  // State for modals
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mapCenter] = useState([51.505, -0.09]);

  // State for new route form
  const [newRoute, setNewRoute] = useState({
    name: "",
    team: "Team Green",
    day: "Monday",
    hotels: [],
    status: "Active"
  });

  // Available teams and days
  const teams = ["Team Green", "Team Blue", "Team Red", "Team Yellow"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const allHotels = ["Grand Plaza Hotel", "Seaside Resort", "Urban Suites", "Mountain Lodge", "Riverside Hotel", "Harbor View"];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoute(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle hotel toggle
  const toggleHotel = (hotel) => {
    setNewRoute(prev => ({
      ...prev,
      hotels: prev.hotels.includes(hotel)
        ? prev.hotels.filter(h => h !== hotel)
        : [...prev.hotels, hotel]
    }));
  };

  // Add new route
  const handleAddRoute = (e) => {
    e.preventDefault();
    // In a real app, you would generate coordinates based on hotels
    const defaultCoordinates = [
      [51.505, -0.09],
      [51.51, -0.1],
      [51.515, -0.1],
      [51.52, -0.12]
    ];
    
    const route = {
      id: routes.length + 1,
      ...newRoute,
      distance: "0 km", // Would calculate in real app
      duration: "0 hours", // Would calculate in real app
      coordinates: defaultCoordinates
    };
    
    setRoutes([...routes, route]);
    setShowAddRoute(false);
    setNewRoute({
      name: "",
      team: "Team Green",
      day: "Monday",
      hotels: [],
      status: "Active"
    });
  };

  // Status badge classes
  const statusClasses = {
    "Active": "status-active",
    "Inactive": "status-inactive",
    "Pending": "status-pending"
  };

  // Calculate route statistics
  const activeRoutes = routes.filter(r => r.status === "Active").length;
  const totalDistance = routes.reduce((sum, route) => {
    return sum + parseFloat(route.distance.split(' ')[0]);
  }, 0).toFixed(1);

  return (
    <div className="content">
      <div>
        <h2>Routes Operations</h2>
        <br />
      </div>
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Active Routes</h3>
            <span>🛣️</span>
          </div>
          <h4>{activeRoutes}</h4>
          <p>Out of {routes.length} total routes</p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>Total Distance</h3>
            <span>📏</span>
          </div>
          <h4>{totalDistance} km</h4>
          <p>Across all routes</p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>Teams On Route</h3>
            <span>👷</span>
          </div>
          <h4>{new Set(routes.map(r => r.team)).size}</h4>
          <p>Active this week</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Collection Routes</h3>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddRoute(true)}
          >
            + Add Route
          </button>
        </div>
        <DataTable 
          columns={["Route Name", "Team", "Day", "Hotels", "Distance", "Duration", "Status", "Actions"]} 
          rows={routes.map(route => ({
            "Route Name": route.name,
            "Team": route.team,
            "Day": route.day,
            "Hotels": (
              <div className="hotels-list">
                {route.hotels.map((hotel, index) => (
                  <span key={index} className="hotel-tag">
                    {hotel}
                    {index < route.hotels.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            ),
            "Distance": route.distance,
            "Duration": route.duration,
            "Status": (
              <span className={`status-badge ${statusClasses[route.status]}`}>
                {route.status}
              </span>
            ),
            "Actions": (
              <div className="route-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowRouteDetails(route)}
                >
                  Details
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setSelectedRoute(route)}
                >
                  View Map
                </button>
              </div>
            )
          }))} 
        />
      </div>

      {/* Route Map Modal */}
      {selectedRoute && (
        <div className="modal large-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedRoute.name} - Route Map</h3>
              <span className="close-modal" onClick={() => setSelectedRoute(null)}>
                &times;
              </span>
            </div>
            <div className="map-container">
              <MapContainer 
                center={mapCenter} 
                zoom={13} 
                style={{ height: '500px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {selectedRoute.coordinates.map((coord, index) => (
                  <Marker key={index} position={coord}>
                    <Popup>
                      {index === 0 && "Starting Point"}
                      {index === selectedRoute.coordinates.length - 1 && "Ending Point"}
                      {index > 0 && index < selectedRoute.coordinates.length - 1 && 
                        `${selectedRoute.hotels[index - 1] || 'Checkpoint'}`}
                    </Popup>
                  </Marker>
                ))}
                <Polyline 
                  positions={selectedRoute.coordinates}
                  color="blue"
                  weight={5}
                  opacity={0.7}
                />
              </MapContainer>
              <div className="route-map-details">
                <div className="detail-row">
                  <span className="detail-label">Team:</span>
                  <span>{selectedRoute.team}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Day:</span>
                  <span>{selectedRoute.day}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Distance:</span>
                  <span>{selectedRoute.distance}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span>{selectedRoute.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Details Modal */}
      {showRouteDetails && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{showRouteDetails.name} Details</h3>
              <span className="close-modal" onClick={() => setShowRouteDetails(null)}>
                &times;
              </span>
            </div>
            <div className="route-details">
              <div className="detail-row">
                <span className="detail-label">Team:</span>
                <span>{showRouteDetails.team}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Day:</span>
                <span>{showRouteDetails.day}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${statusClasses[showRouteDetails.status]}`}>
                  {showRouteDetails.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Distance:</span>
                <span>{showRouteDetails.distance}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span>{showRouteDetails.duration}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Hotels:</span>
                <ul className="hotels-list">
                  {showRouteDetails.hotels.map((hotel, index) => (
                    <li key={index}>{hotel}</li>
                  ))}
                </ul>
              </div>
              <div className="map-preview">
                <MapContainer 
                  center={showRouteDetails.coordinates[0]} 
                  zoom={12} 
                  style={{ height: '200px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Polyline 
                    positions={showRouteDetails.coordinates}
                    color="blue"
                    weight={3}
                    opacity={0.7}
                  />
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddRoute && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Collection Route</h3>
              <span className="close-modal" onClick={() => setShowAddRoute(false)}>
                &times;
              </span>
            </div>
            <form onSubmit={handleAddRoute}>
              <div className="form-group">
                <label>Route Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  required
                  value={newRoute.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Assigned Team</label>
                <select
                  name="team"
                  className="form-control"
                  required
                  value={newRoute.team}
                  onChange={handleInputChange}
                >
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Collection Day</label>
                <select
                  name="day"
                  className="form-control"
                  required
                  value={newRoute.day}
                  onChange={handleInputChange}
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Route Status</label>
                <select
                  name="status"
                  className="form-control"
                  required
                  value={newRoute.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Hotels on Route</label>
                <div className="hotels-selector">
                  {allHotels.map(hotel => (
                    <button
                      type="button"
                      key={hotel}
                      className={`hotel-option ${
                        newRoute.hotels.includes(hotel) ? 'selected' : ''
                      }`}
                      onClick={() => toggleHotel(hotel)}
                    >
                      {hotel}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowAddRoute(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionRoutes;