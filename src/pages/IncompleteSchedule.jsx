import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import "../css/Schedulling.css";

// Services
import { getCollections } from "../services/ScheduleService";
import { getHotels } from "../services/hotelServices";

const IncompleteSchedule = () => {
  const [collections, setCollections] = useState([]);
  const [, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, hotelsRes] = await Promise.all([
          getCollections(),
          getHotels(),
        ]);

        setHotels(hotelsRes);

        const now = new Date();
        const todayName = now.toLocaleDateString("en-US", { weekday: "long" });
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Filter schedules that are incomplete
        const incompleteSchedules = collectionsRes.filter((item) => {
          const [hours, minutes] = item.end_time.split(":").map(Number);
          const scheduleMinutes = hours * 60 + minutes;

          if (item.day === todayName) {
            // Kama ni siku ya leo, check kama muda umepita
            return currentMinutes > scheduleMinutes;
          } else {
            // Kama ni siku zilizopita, automatically ziwe late
            // Lakini siku zijazo zisioneshwe
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

            // Ikiwa index ya item < index ya leo => siku imepita
            if (itemIndex < todayIndex) return true;

            // Ikiwa index ya item > index ya leo => siku bado haijafika
            return false;
          }
        });

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

  // Download PDF
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/download-schedules/");
      if (!response.ok) throw new Error("Failed to download PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "incomplete_schedules.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading incomplete schedules...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Transform rows for DataTable
  const rows = collections.map((item) => ({
    Day: item.day,
    "Start Time": item.start_time,
    "End Time": item.end_time,
    Hotel: item.hotel_name,
    Status: item.status,
  }));

  return (
    <div className="content">
      <div className="page-header">
        <h2>Incomplete Schedules</h2>
      </div>
      <br />

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
          columns={["Day", "Start Time", "End Time", "Hotel", "Status"]}
          rows={rows}
        />
      </div>
    </div>
  );
};

export default IncompleteSchedule;
