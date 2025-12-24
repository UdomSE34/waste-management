import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import "../css/Schedulling.css";

// Services
import { getCollections } from "../services/ScheduleService";
import { getHotels } from "../services/hotelServices";

const IncompleteSchedule = () => {
  const [collections, setCollections] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, hotelsRes] = await Promise.all([
          getCollections(),
          getHotels(),
        ]);

        // ✅ FIX: Ensure data is array before using filter
        const collectionsArray = Array.isArray(collectionsRes) ? collectionsRes : 
                                collectionsRes?.results ? collectionsRes.results : 
                                collectionsRes?.schedules ? collectionsRes.schedules : 
                                collectionsRes?.data ? collectionsRes.data : [];

        const hotelsArray = Array.isArray(hotelsRes) ? hotelsRes : 
                           hotelsRes?.results ? hotelsRes.results : 
                           hotelsRes?.data ? hotelsRes.data : [];

        console.log('Collections data:', {
          original: collectionsRes,
          isArray: Array.isArray(collectionsRes),
          converted: collectionsArray,
          length: collectionsArray.length
        });

        setHotels(hotelsArray);

        // ✅ REMOVED ADDRESS FILTER - Now get ALL incomplete schedules
        console.log('Total collections:', collectionsArray.length);

        // Filter schedules that are incomplete
        const incompleteSchedules = collectionsArray.filter((item) => {
          if (!item || !item.slot) {
            console.warn('Item missing slot:', item);
            return false; // guard against missing slot
          }

          // Format slot display
          const formatSlotForTime = (slotValue) => {
            if (!slotValue) return null;
            
            if (slotValue === "Morning") {
              return "06:00 – 12:00";
            } else if (slotValue === "Afternoon") {
              return "06:00 – 18:00";
            }
            
            return slotValue.includes(":") ? slotValue : null;
          };

          const formattedSlot = formatSlotForTime(item.slot);
          if (!formattedSlot) {
            console.warn('Invalid slot format:', item.slot);
            return false;
          }

          // Expect format: "HH:MM – HH:MM"
          const parts = formattedSlot.split("–").map((p) => p.trim());
          if (parts.length !== 2) {
            console.warn('Invalid slot parts:', formattedSlot);
            return false;
          }

          const [endHour, endMinute] = parts[1].split(":").map(Number);
          if (isNaN(endHour) || isNaN(endMinute)) {
            console.warn('Invalid time parsing:', parts[1]);
            return false;
          }

          const scheduleMinutes = endHour * 60 + endMinute;

          const now = new Date();
          const todayName = now.toLocaleDateString("en-US", {
            weekday: "long",
          });
          const currentMinutes = now.getHours() * 60 + now.getMinutes();

          // Check if schedule is for today
          if (item.day === todayName) {
            // Today → late if current time has passed end time
            return currentMinutes > scheduleMinutes;
          } else {
            // For other days, check if it's a past day
            const weekDays = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];
            const todayIndex = weekDays.indexOf(todayName);
            const itemIndex = weekDays.indexOf(item.day);

            if (itemIndex < 0) {
              console.warn('Invalid day:', item.day);
              return false;
            }

            if (itemIndex < todayIndex) {
              // Past day → definitely overdue
              return true;
            } else if (itemIndex === todayIndex) {
              // Same day (today) → check time
              return currentMinutes > scheduleMinutes;
            } else {
              // Future day → not overdue yet
              return false;
            }
          }
        });

        console.log('Incomplete schedules found:', incompleteSchedules.length);
        console.log('Sample incomplete:', incompleteSchedules.slice(0, 3));
        
        setCollections(incompleteSchedules);
      } catch (err) {
        console.error("Error fetching schedules:", err);
        setError(err.message || "Error fetching schedules");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format slot display
  const formatSlotDisplay = (slotValue) => {
    if (!slotValue) return "N/A";
    
    if (slotValue === "Morning") {
      return "06:00 – 12:00";
    } else if (slotValue === "Afternoon") {
      return "06:00 – 18:00";
    }
    
    return slotValue.includes(":") ? slotValue : slotValue;
  };

  if (loading) {
    return (
      <div className="content">
        <div className="loading">Loading incomplete schedules...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="content">
        <div className="error-alert">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <p className="text-muted">Check console for more details</p>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Transform rows for DataTable
  const rows = collections.map((item) => ({
    Day: item.day || "N/A",
    "Time Range": formatSlotDisplay(item.slot),
    Hotel: item.hotel_name || "Unknown Hotel",
    Address: item.address || "N/A",
    Status: (
      <span style={{ 
        color: "#dc3545", 
        fontWeight: "bold",
        backgroundColor: "#f8d7da",
        padding: "4px 8px",
        borderRadius: "4px"
      }}>
        OVERDUE
      </span>
    ),
  }));

  // Calculate stats
  const overdueCount = collections.length;
  const overdueHotels = [...new Set(collections.map(c => c.hotel_name).filter(Boolean))].length;
  const locations = [...new Set(collections.map(c => c.address).filter(Boolean))];

  return (
    <div className="content">
      <div className="page-header">
        <h2>Incomplete Schedules</h2>
        {overdueCount > 0 && (
          <div className="stats-badge">
            <span className="badge bg-danger">
              {overdueCount} Overdue Schedule{overdueCount !== 1 ? 's' : ''}
            </span>
            <span className="badge bg-warning" style={{ marginLeft: "10px" }}>
              {overdueHotels} Hotel{overdueHotels !== 1 ? 's' : ''}
            </span>
            <span className="badge bg-info" style={{ marginLeft: "10px" }}>
              {locations.length} Location{locations.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      <br />

      {/* Info Box */}
      {collections.length > 0 ? (
        <div className="alert alert-warning">
          <strong>⚠️ Overdue Alert:</strong> Showing <strong>{overdueCount}</strong> incomplete schedules 
          from <strong>{overdueHotels}</strong> hotels across all locations.
        </div>
      ) : (
        <div className="alert alert-success">
          <strong>🎉 All Clear!</strong> No overdue schedules found across all hotels.
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Overdue Collections</h3>
          <div className="filter-info">
            <small>
              Showing incomplete schedules from <strong>ALL</strong> hotels and locations
            </small>
          </div>
        </div>

        {collections.length > 0 ? (
          <>
            <DataTable
              columns={["Day", "Time Range", "Hotel", "Address", "Status"]}
              rows={rows}
            />
            
            {/* Summary Card */}
            <div className="card mt-4">
              <div className="card-header">
                <h4>📊 Overdue Summary</h4>
              </div>
              <div className="card-body">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
                  <div style={{ flex: "1", minWidth: "300px" }}>
                    <h5>📅 By Day:</h5>
                    <ul style={{ listStyle: "none", paddingLeft: 0, maxHeight: "200px", overflowY: "auto" }}>
                      {Object.entries(
                        collections.reduce((acc, item) => {
                          const day = item.day || "Unknown";
                          acc[day] = (acc[day] || 0) + 1;
                          return acc;
                        }, {})
                      )
                      .sort(([dayA], [dayB]) => {
                        const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                        return daysOrder.indexOf(dayA) - daysOrder.indexOf(dayB);
                      })
                      .map(([day, count]) => (
                        <li key={day} style={{ 
                          padding: "8px 0", 
                          borderBottom: "1px solid #eee",
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <strong>{day}:</strong> 
                          <span className="badge bg-danger">{count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ flex: "1", minWidth: "300px" }}>
                    <h5>🏨 By Hotel:</h5>
                    <ul style={{ listStyle: "none", paddingLeft: 0, maxHeight: "200px", overflowY: "auto" }}>
                      {Object.entries(
                        collections.reduce((acc, item) => {
                          const hotel = item.hotel_name || "Unknown Hotel";
                          acc[hotel] = (acc[hotel] || 0) + 1;
                          return acc;
                        }, {})
                      )
                      .sort(([, countA], [, countB]) => countB - countA) // Sort by count descending
                      .map(([hotel, count]) => (
                        <li key={hotel} style={{ 
                          padding: "8px 0", 
                          borderBottom: "1px solid #eee",
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <span>{hotel}</span> 
                          <span className="badge bg-warning">{count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
              <h3 style={{ color: "#28a745" }}>All Schedules Completed!</h3>
              <p style={{ color: "#6c757d", fontSize: "1.1rem" }}>
                Great job! All hotel schedules are up to date.
              </p>
              <button 
                className="btn btn-success mt-3"
                onClick={() => window.location.reload()}
              >
                Refresh Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncompleteSchedule;