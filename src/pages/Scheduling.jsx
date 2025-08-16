import { useState } from "react";
import DataTable from "../components/DataTable";
import "../css/Schedulling.css";

const Scheduling = () => {
  // Sample data
  const collectionsData = [
    { id: 1, time: "08:30 AM", hotel: "Grand Plaza Hotel", type: "Paper/Cardboard", quantity: 120, team: "Team Green", status: "Completed", date: "2023-11-07" },
    { id: 2, time: "10:15 AM", hotel: "Seaside Resort", type: "Glass", quantity: 85, team: "Team Blue", status: "Completed", date: "2023-11-07" },
    { id: 3, time: "11:45 AM", hotel: "Urban Suites", type: "Organic Waste", quantity: 150, team: "Team Green", status: "In Progress", date: "2023-11-07" },
    { id: 4, time: "02:30 PM", hotel: "Mountain Lodge", type: "Plastic", quantity: 65, team: "Team Red", status: "Pending", date: "2023-11-07" },
    { id: 5, time: "04:00 PM", hotel: "Riverside Hotel", type: "Metal", quantity: 45, team: "Team Yellow", status: "Pending", date: "2023-11-07" },
    { id: 6, time: "09:00 AM", hotel: "Downtown Inn", type: "Paper/Cardboard", quantity: 90, team: "Team Green", status: "Scheduled", date: "2023-11-08" },
    { id: 7, time: "11:30 AM", hotel: "Harbor View", type: "Glass", quantity: 110, team: "Team Blue", status: "Scheduled", date: "2023-11-08" },
  ];

  // State for modals
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [calendarView, setCalendarView] = useState("month");
  
  // State for form
  const [formData, setFormData] = useState({
    hotel: "",
    wasteType: "",
    date: "",
    time: "",
    quantity: "",
    team: "",
    notes: ""
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New collection scheduled:", formData);
    setShowNewCollection(false);
    setFormData({
      hotel: "",
      wasteType: "",
      date: "",
      time: "",
      quantity: "",
      team: "",
      notes: ""
    });
  };

  
  return (
    <div className="content">
      <div class="">
                <h2>Daily Collections</h2>
           <br />
           <br />
                
        </div>
            
            <div class="waste-legend">
                <div class="legend-item">
                    <div class="legend-color color-paper"></div>
                    <span>Paper/Cardboard</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color color-glass"></div>
                    <span>Glass</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color color-compost"></div>
                    <span>Organic Waste</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color color-plastic"></div>
                    <span>Plastic</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color color-metal"></div>
                    <span>Metal</span>
                </div>
            </div>
            

      <div className="card">
        <div className="card-header">
          <h3>Today Collections</h3>
          <div>
            <button 
              className="btn btn-outline" 
              onClick={() => setShowCalendar(true)}
            >
              View Calendar
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowNewCollection(true)}
              style={{ marginLeft: '10px' }}
            >
              + New Collection
            </button>
          </div>
        </div>
        <DataTable 
          columns={["Time", "Hotel", "Waste Type", "Quantity", "Team", "Status", "Action"]} 
          rows={collectionsData.map(item => ({
            Time: item.time,
            Hotel: item.hotel,
            "Waste Type": (
              <span className={`waste-badge ${
                item.type === "Paper/Cardboard" ? "waste-paper" :
                item.type === "Glass" ? "waste-glass" :
                item.type === "Organic Waste" ? "waste-compost" :
                item.type === "Plastic" ? "waste-plastic" :
                item.type === "Metal" ? "waste-metal" : ""
              }`}>
                {item.type}
              </span>
            ),
            Quantity: `${item.quantity} kg`,
            Team: item.team,
            Status: (
              <span className={`status-badge ${
                item.status === "Completed" ? "status-completed" :
                item.status === "In Progress" ? "status-in-progress" :
                "status-pending"
              }`}>
                {item.status}
              </span>
            ),
            Action: (
              <button className="btn btn-outline">
                {item.status === "In Progress" ? "Track" : "Details"}
              </button>
            )
          }))} 
        />
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Collection Calendar</h3>
              <span className="close-modal" onClick={() => setShowCalendar(false)}>
                &times;
              </span>
            </div>

            <div className="schedule-controls">
              <div className="filter-options">
                <button className="btn btn-outline">All Hotels</button>
                <button className="btn btn-outline">Priority Only</button>
                <select className="form-control">
                  <option>All Waste Types</option>
                  <option>Paper/Cardboard</option>
                  <option>Glass</option>
                  <option>Organic Waste</option>
                  <option>Plastic</option>
                  <option>Metal</option>
                </select>
              </div>
              <div className="view-options">
                <button 
                  className={`btn ${calendarView === 'day' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setCalendarView('day')}
                >
                  Day
                </button>
                <button 
                  className={`btn ${calendarView === 'week' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setCalendarView('week')}
                >
                  Week
                </button>
                <button 
                  className={`btn ${calendarView === 'month' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setCalendarView('month')}
                >
                  Month
                </button>
              </div>
            </div>

            <div className="calendar-view">
              <div className="calendar-header">
                <div className="calendar-nav">
                  <button className="btn btn-outline">‹</button>
                  <h3 className="calendar-title">November 2023</h3>
                  <button className="btn btn-outline">›</button>
                </div>
                <button className="btn btn-outline">Today</button>
              </div>

              {calendarView === 'month' && (
                <div className="calendar-grid">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="calendar-day-header">{day}</div>
                  ))}
                  {/* Calendar days would be generated here */}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Collection Modal */}
      {showNewCollection && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule New Collection</h3>
              <span className="close-modal" onClick={() => setShowNewCollection(false)}>
                &times;
              </span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="hotel">Hotel Client</label>
                <select 
                  id="hotel" 
                  name="hotel"
                  className="form-control" 
                  required
                  value={formData.hotel}
                  onChange={handleInputChange}
                >
                  <option value="">Select Hotel</option>
                  <option>Grand Plaza Hotel</option>
                  <option>Seaside Resort</option>
                  <option>Urban Suites</option>
                  <option>Harbor View</option>
                  <option>Downtown Inn</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="wasteType">Waste Type</label>
                <select 
                  id="wasteType" 
                  name="wasteType"
                  className="form-control" 
                  required
                  value={formData.wasteType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Waste Type</option>
                  <option>Paper/Cardboard</option>
                  <option>Glass</option>
                  <option>Organic Waste</option>
                  <option>Plastic</option>
                  <option>Metal</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Collection Date</label>
                <input 
                  type="date" 
                  id="date"
                  name="date"
                  className="form-control" 
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">Collection Time</label>
                <input 
                  type="time" 
                  id="time"
                  name="time"
                  className="form-control" 
                  required
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity">Estimated Quantity (kg)</label>
                <input 
                  type="number" 
                  id="quantity"
                  name="quantity"
                  className="form-control" 
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="team">Assigned Team</label>
                <select 
                  id="team" 
                  name="team"
                  className="form-control" 
                  required
                  value={formData.team}
                  onChange={handleInputChange}
                >
                  <option value="">Select Team</option>
                  <option>Team Green</option>
                  <option>Team Blue</option>
                  <option>Team Red</option>
                  <option>Team Yellow</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowNewCollection(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Schedule Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;