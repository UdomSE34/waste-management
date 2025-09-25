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

        // Filter schedules that are incomplete
        const incompleteSchedules = collectionsRes.filter((item) => {
          if (!item.slot) return false; // guard against missing slot

          // Expect format: "HH:MM – HH:MM"
          const parts = item.slot.split("–").map((p) => p.trim());
          if (parts.length !== 2) return false;

          const [endHour, endMinute] = parts[1].split(":").map(Number);
          const scheduleMinutes = endHour * 60 + endMinute;

          const now = new Date();
          const todayName = now.toLocaleDateString("en-US", {
            weekday: "long",
          });
          const currentMinutes = now.getHours() * 60 + now.getMinutes();

          if (item.day === todayName) {
            // Today → late if current time has passed end time
            return currentMinutes > scheduleMinutes;
          } else {
            // Past days → always late
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

            if (itemIndex < todayIndex) return true; // past day
            return false; // future day → not late
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

  if (loading)
    return <div className="loading">Loading incomplete schedules...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Transform rows for DataTable
  const rows = collections.map((item) => ({
    Day: item.day,
    "Time Range": item.slot,
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
        </div>

        <DataTable
          columns={["Day", "Time Range", "Hotel", "Status"]}
          rows={rows}
        />
      </div>
    </div>
  );
};

export default IncompleteSchedule;
