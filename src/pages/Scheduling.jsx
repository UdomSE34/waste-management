// Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import DataTable from "../components/DataTable";
import "../css/Schedulling.css";
import {
  getCollections,
  updateCollection,
  updateScheduleVisibility,
  sendTodayMessage,
  sendTomorrowMessage,
  downloadFilteredPDF,
  checkAndInitialize
} from "../services/ScheduleService";
import { getHotels } from "../services/hotelServices";

const Scheduling = () => {
  const [collections, setCollections] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedHotels, setSelectedHotels] = useState({});
  const [apologyModalVisible, setApologyModalVisible] = useState(false);
  const [selectedHotelIdForApology, setSelectedHotelIdForApology] = useState(null);
  const [sendToday, setSendToday] = useState(false);
  const [sendTomorrow, setSendTomorrow] = useState(false);
  const alertRef = useRef(null);

  // ✅ HII NDIO ARRAY YAKO YA FILTER
  const address = [
    "Paje",
    "Michanvi",
    "Bwejuu",
  ];
  
  // 🔥 Updated filter state
  const [hotelFilter, setHotelFilter] = useState("All");

  // Fetch data with AUTO-GENERATION
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ✅ AUTO-GENERATION: Check and initialize system
        await checkAndInitialize();
        
        const [collectionsRes, hotelsRes] = await Promise.all([
          getCollections(),
          getHotels(),
        ]);

        // ✅ FIX: Ensure data is array
        const collectionsArray = Array.isArray(collectionsRes) ? collectionsRes : 
                                collectionsRes?.results ? collectionsRes.results : 
                                collectionsRes?.schedules ? collectionsRes.schedules : 
                                collectionsRes?.data ? collectionsRes.data : [];

        const hotelsArray = Array.isArray(hotelsRes) ? hotelsRes : 
                           hotelsRes?.results ? hotelsRes.results : 
                           hotelsRes?.data ? hotelsRes.data : [];

        const today = new Date().toLocaleDateString("en-US", {
          weekday: "long",
        });

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toLocaleDateString("en-US", {
          weekday: "long",
        });

        // ✅ FILTER: Tafuta address zilizo kwenye array yako
        // Hii inafilter kabla ya kuweka kwenye state
        const filteredCollections = collectionsArray.filter(item => {
          if (!item.address) return false;
          
          // Check kama address yoyote kwenye array iko kwenye item.address
          return address.some(addr => 
            item.address.toLowerCase().includes(addr.toLowerCase())
          );
        });

        const todaySchedules = filteredCollections.filter(
          (item) => item.status === "Pending" && item.day === today
        );

        const yesterdaySchedules = filteredCollections.filter(
          (item) => item.status === "Pending" && item.day === yesterday
        );

        if (yesterdaySchedules.length > 0) {
          setYesterdayCount(yesterdaySchedules.length);
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 8000);
        }

        setCollections([
          ...yesterdaySchedules.map((s) => ({ ...s, isYesterday: true })),
          ...todaySchedules.map((s) => ({ ...s, isYesterday: false })),
        ]);

        // Filter hotels pia kwa address
        const filteredHotels = hotelsArray.filter(hotel => 
          address.some(addr => 
            hotel.address.toLowerCase().includes(addr.toLowerCase())
          )
        );
        setHotels(filteredHotels);

        const initSelected = {};
        filteredHotels.forEach((h) => (initSelected[h.id || h.hotel_id] = false));
        setSelectedHotels(initSelected);
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isWithinTimeWindow = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 18 && hour < 21;
  };

  const handleComplete = async (scheduleId) => {
    try {
      await updateCollection(scheduleId, { status: "Completed" });
      setCollections((prev) =>
        prev.filter((item) => item.schedule_id !== scheduleId)
      );
    } catch (err) {
      console.error("Failed to complete schedule:", err);
      alert("Failed to update schedule. Please try again.");
    }
  };

  // 🔥 UPDATED: Handle download PDF with filters
  const handleDownloadPDF = async () => {
    try {
      const addressesToDownload = hotelFilter === "All" 
        ? []
        : [hotelFilter];
      
      const response = await downloadFilteredPDF(addressesToDownload);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const filename = hotelFilter === "All" 
        ? "all_hotels_schedules.pdf"
        : `${hotelFilter.replace(/\s+/g, '_').toLowerCase()}_schedules.pdf`;
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      alert("Failed to download PDF. Please try again.");
    }
  };

  // Alert click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertRef.current && !alertRef.current.contains(event.target))
        setShowAlert(false);
    };
    if (showAlert) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAlert]);

  const handleCheckboxChange = (hotelId) => {
    setSelectedHotels((prev) => ({ ...prev, [hotelId]: !prev[hotelId] }));
  };

  const distinctHotels = Array.from(
    new Set(collections.map((c) => c.hotel_name))
  ).map((name) => hotels.find((h) => h.name === name));

  const handleApplyModal = async () => {
    try {
      const hotelsToShow = Object.entries(selectedHotels)
        .filter(([, checked]) => checked)
        .map(([id]) => parseInt(id));

      await Promise.all(
        distinctHotels.map((h) =>
          updateScheduleVisibility(h.id || h.hotel_id, hotelsToShow.includes(h.id || h.hotel_id))
        )
      );

      setCollections((prev) =>
        prev.map((c) => ({
          ...c,
          is_visible: hotelsToShow.includes(c.hotel_id),
        }))
      );
      setShowModal(false);
    } catch (err) {
      console.error("Failed to update visibility:", err);
      alert("Failed to update visibility.");
    }
  };

  // Helpers
  const toMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getEndMinutesFromSlot = (slotRange) => {
    if (!slotRange || !slotRange.includes("–")) return null;
    return toMinutes(slotRange.split("–")[1].trim());
  };

  // Format slot display
  const formatSlotDisplay = (slotValue) => {
    if (!slotValue) return "N/A";
    
    // Check if slot is "Morning" or "Afternoon"
    if (slotValue === "Morning") {
      return "06:00 – 12:00";
    } else if (slotValue === "Afternoon") {
      return "06:00 – 18:00";
    }
    
    // Check if slot already contains time range
    if (slotValue.includes(":")) {
      return slotValue;
    }
    
    return slotValue;
  };

  // 🔥 FILTER COLLECTIONS BEFORE TABLE (now uses address array)
  const filteredCollections = hotelFilter === "All"
    ? collections
    : collections.filter((c) => 
        c.address && c.address.toLowerCase().includes(hotelFilter.toLowerCase())
      );

  // TABLE ROWS
  const rows = filteredCollections.map((item) => {
    const endMinutes = getEndMinutesFromSlot(item.slot);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isLate = endMinutes !== null && currentMinutes > endMinutes + 15;

    return {
      Day: item.day + (item.isYesterday ? " (Yesterday)" : ""),
      "Time Range": formatSlotDisplay(item.slot),
      Hotel: item.hotel_name,
      Address: item.address,
      Status: item.status,
      Action: (
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            className={`btn ${
              item.isYesterday ? "btn-danger blink" : "btn-primary"
            }`}
            onClick={() => handleComplete(item.schedule_id)}
          >
            Complete
          </button>

          {isWithinTimeWindow() && item.status === "Pending" && (
            <button
              className="btn btn-warning"
              onClick={() => {
                setSelectedHotelIdForApology(item.hotel_id);
                setApologyModalVisible(true);
              }}
            >
              📧 Send Apology
            </button>
          )}
        </div>
      ),
      rowClassName: item.isYesterday
        ? "yesterday-row"
        : isLate
        ? "table-danger"
        : "",
    };
  });

  if (loading) return <div className="loading">Loading scheduling data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="content">
      <div className="page-header">
        <h2>Daily Collections</h2>
        <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
          Filter Hotels
        </button>
      </div>
      <br />

      {/* YESTERDAY ALERT */}
      {showAlert && (
        <div className="popup-overlay">
          <div ref={alertRef} className="popup-alert">
            <div className="popup-header">
              <h3>⚠️ Pending Collections from Yesterday</h3>
              <button
                className="popup-close"
                onClick={() => setShowAlert(false)}
              >
                &times;
              </button>
            </div>
            <div className="popup-content">
              <p>
                There are <strong>{yesterdayCount}</strong> pending schedules
                from yesterday.
              </p>
              <div className="popup-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const yesterdayRows =
                      document.querySelectorAll(".yesterday-row");
                    if (yesterdayRows.length > 0)
                      yesterdayRows[0].scrollIntoView({ behavior: "smooth" });
                    setShowAlert(false);
                  }}
                >
                  View Details
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAlert(false)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card">
        <div className="card-header">
          <h3>Collections</h3>

          {(filteredCollections.length > 0 || yesterdayCount > 0) && (
            <button className="btn btn-primary" onClick={handleDownloadPDF}>
              📄 Download PDF
            </button>
          )}

          {/* HOTEL FILTER UI */}
          <div className="filter-box">
            <label style={{ marginRight: "10px" }}>Filter Location:</label>
            <select
              value={hotelFilter}
              onChange={(e) => setHotelFilter(e.target.value)}
              className="form-control"
              style={{ width: "200px", display: "inline-block" }}
            >
              <option value="All">All Locations</option>
              {address.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            
            {hotelFilter !== "All" && (
              <span style={{ marginLeft: "10px", color: "#666", fontSize: "0.9rem" }}>
                Showing: {hotelFilter} ({filteredCollections.length} schedules)
              </span>
            )}
          </div>
        </div>

        <DataTable
          columns={["Day", "Time Range", "Hotel", "Address", "Status", "Action"]}
          rows={rows}
        />
      </div>

      {/* HOTEL FILTER MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Select Hotels to Show</h3>
            <div className="modal-body">
              {hotels.map((hotel) => (
                <div key={hotel.id || hotel.hotel_id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedHotels[hotel.id || hotel.hotel_id] || false}
                      onChange={() => handleCheckboxChange(hotel.id || hotel.hotel_id)}
                    />
                    {hotel.name} ({hotel.address})
                  </label>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleApplyModal}>
                Apply
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APOLOGY MODAL */}
      {apologyModalVisible && (
        <div className="modal">
          <div className="modal-content">
            <h3>Send Apology</h3>
            <div className="modal-body">
              <div
                className={`apology-toggle ${sendToday ? "active" : ""}`}
                onClick={() => setSendToday(!sendToday)}
              >
                Today
              </div>
              <div
                className={`apology-toggle ${sendTomorrow ? "active" : ""}`}
                onClick={() => setSendTomorrow(!sendTomorrow)}
              >
                Tomorrow
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    if (sendToday)
                      await sendTodayMessage(selectedHotelIdForApology);
                    if (sendTomorrow)
                      await sendTomorrowMessage(selectedHotelIdForApology);
                    alert("Apology sent successfully!");
                    setApologyModalVisible(false);
                    setSendToday(false);
                    setSendTomorrow(false);
                  } catch {
                    alert("Failed to send apology.");
                  }
                }}
              >
                Send
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setApologyModalVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;