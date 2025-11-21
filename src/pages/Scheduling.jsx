import { useState, useEffect, useRef } from "react";
import DataTable from "../components/DataTable";
import "../css/Schedulling.css";
import {
  getCollections,
  updateCollection,
  updateScheduleVisibility,
  sendTodayMessage,
  sendTomorrowMessage,
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
  const [selectedHotelIdForApology, setSelectedHotelIdForApology] =
    useState(null);
  const [sendToday, setSendToday] = useState(false);
  const [sendTomorrow, setSendTomorrow] = useState(false);
  const alertRef = useRef(null);

  // 🔥 New filter state
  const [hotelFilter, setHotelFilter] = useState("All");

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

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("https://back.deploy.tz/download-schedules/");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "today_yesterday_schedules.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {}
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, hotelsRes] = await Promise.all([
          getCollections(),
          getHotels(),
        ]);

        const today = new Date().toLocaleDateString("en-US", {
          weekday: "long",
        });

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toLocaleDateString("en-US", {
          weekday: "long",
        });

        const todaySchedules = collectionsRes.filter(
          (item) => item.status === "Pending" && item.day === today
        );

        const yesterdaySchedules = collectionsRes.filter(
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

        setHotels(hotelsRes);

        const initSelected = {};
        hotelsRes.forEach((h) => (initSelected[h.id] = false));
        setSelectedHotels(initSelected);
      } catch (err) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
          updateScheduleVisibility(h.id, hotelsToShow.includes(h.id))
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

  // 🔥 FILTER COLLECTIONS BEFORE TABLE
  const filteredCollections =
    hotelFilter === "All"
      ? collections
      : collections.filter((c) => c.address === hotelFilter);

  // TABLE ROWS
  const rows = filteredCollections.map((item) => {
    const endMinutes = getEndMinutesFromSlot(item.slot);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isLate = endMinutes !== null && currentMinutes > endMinutes + 15;

    return {
      Day: item.day + (item.isYesterday ? " (Yesterday)" : ""),
      "Time Range": item.slot,
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

          {(collections.length > 0 || yesterdayCount > 0) && (
            <button className="btn btn-primary" onClick={handleDownloadPDF}>
              📄 Download PDF
            </button>
          )}

          {/* HOTEL FILTER UI */}
          <div className="filter-box">
            <label style={{ marginRight: "10px" }}>Filter Hotel:</label>
            <select
              value={hotelFilter}
              onChange={(e) => setHotelFilter(e.target.value)}
              className="form-control"
              style={{ width: "200px", display: "inline-block" }}
            >
              <option value="All">All</option>
              <option value="Michanvi">Michanvi</option>
              <option value="Page">Page</option>
              <option value="Bwejuu">Bwejuu</option>
            </select>
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
                <div key={hotel.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedHotels[hotel.id] || false}
                      onChange={() => handleCheckboxChange(hotel.id)}
                    />
                    {hotel.name}
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
