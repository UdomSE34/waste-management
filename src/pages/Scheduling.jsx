import { useState, useEffect, useRef } from "react";
import DataTable from "../components/DataTable";
import "../css/Schedulling.css";
  import axios from "axios";

// Services
import {
  getCollections,
  updateCollection,
  updateScheduleVisibility,
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
  const alertRef = useRef(null);

  // ✅ Approve (Complete) a schedule
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

  // Fetch collections and hotels
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

        // Separate schedules
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

        const merged = [
          ...yesterdaySchedules.map((s) => ({ ...s, isYesterday: true })),
          ...todaySchedules.map((s) => ({ ...s, isYesterday: false })),
        ];

        setCollections(merged);
        setHotels(hotelsRes);

        // ✅ Initialize hotel selection using hotel_name
        const initSelected = {};
        hotelsRes.forEach((h) => (initSelected[h.name] = false));
        setSelectedHotels(initSelected);
      } catch (err) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Close alert when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertRef.current && !alertRef.current.contains(event.target)) {
        setShowAlert(false);
      }
    };
    if (showAlert) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAlert]);

  // ✅ Download PDF function



// ✅ Token-aware Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

  const handleDownloadPDF = async () => {
    try {
      const response = await api.fetch("http://127.0.0.1:8000/download-schedules/");
      if (!response.ok) throw new Error("Failed to download PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "today_yesterday_schedules.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Modal checkbox change
  const handleCheckboxChange = (hotelName) => {
    setSelectedHotels((prev) => ({
      ...prev,
      [hotelName]: !prev[hotelName],
    }));
  };

  // Build distinct hotel list from schedules
  const distinctHotels = Array.from(
    new Set(collections.map((c) => c.hotel_name))
  ).map((hotelName) => ({ hotel_name: hotelName }));

  const handleApplyModal = async () => {
    try {
      const hotelsToShow = Object.entries(selectedHotels)
        .filter(([, checked]) => checked)
        .map(([name]) => name);

      // 1️⃣ Update backend for each hotel
      await Promise.all(
        distinctHotels.map((h) =>
          updateScheduleVisibility(
            h.hotel_name,
            hotelsToShow.includes(h.hotel_name)
          )
        )
      );

      // 2️⃣ Update local state to reflect backend
      setCollections((prev) =>
        prev.map((c) => ({
          ...c,
          is_visible: hotelsToShow.includes(c.hotel_name),
        }))
      );

      setShowModal(false);
    } catch (err) {
      console.error("Failed to update visibility:", err);
      alert("Failed to update visibility.");
    }
  };

  // Table helpers
  const toMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const getEndMinutesFromSlot = (slotRange) => {
    if (!slotRange || !slotRange.includes("–")) return null;
    const parts = slotRange.split("–").map((s) => s.trim());
    if (parts.length !== 2) return null;
    return toMinutes(parts[1]);
  };

  const rows = collections.map((item) => {
    const endMinutes = getEndMinutesFromSlot(item.slot);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isLate = endMinutes !== null && currentMinutes > endMinutes + 15;

    return {
      Day: item.day + (item.isYesterday ? " (Yesterday)" : ""),
      "Time Range": item.slot,
      Hotel: item.hotel_name,
      Status: item.status,
      Action: (
        <button
          className={`btn ${
            item.isYesterday ? "btn-danger blink" : "btn-primary"
          }`}
          onClick={() => handleComplete(item.schedule_id)}
        >
          Complete
        </button>
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
        <button
          className="btn btn-secondary"
          onClick={() => setShowModal(true)}
        >
          Filter Hotels
        </button>
      </div>
      <br />

      {/* Popup Alert */}
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
                from yesterday that need attention.
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

      {/* ✅ Single Table */}
      <div className="card">
        <div className="card-header">
          <h3>Collections</h3>
          <div style={{ marginBottom: "15px" }}>
            <button className="btn btn-primary" onClick={handleDownloadPDF}>
              📄 Download PDF
            </button>
          </div>
        </div>
        <DataTable
          columns={["Day", "Time Range", "Hotel", "Status", "Action"]}
          rows={rows}
        />
      </div>

      {/* ✅ Hotel Filter Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Select Hotels to Show</h3>
            <div className="modal-body">
              {distinctHotels.map((hotel) => (
                <div key={hotel.hotel_name}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedHotels[hotel.hotel_name] || false}
                      onChange={() => handleCheckboxChange(hotel.hotel_name)}
                    />
                    {hotel.hotel_name}
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
    </div>
  );
};

export default Scheduling;
