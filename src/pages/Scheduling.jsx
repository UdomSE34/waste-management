import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import "../css/Schedulling.css";

// Services
import { getCollections, updateCollection } from "../services/ScheduleService";
import { getHotels } from "../services/hotelServices";

const Scheduling = () => {
  const [collections, setCollections] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Approve (Complete) a schedule
  const handleComplete = async (scheduleId) => {
    try {
      // Call API to update status to 'Completed'
      await updateCollection(scheduleId, { status: "Completed" });

      // Remove completed item from local state so it disappears
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

        const filteredSchedules = collectionsRes.filter(
          (item) => item.status === "Pending" && item.day === today
        );

        setCollections(filteredSchedules);
        setHotels(hotelsRes);
      } catch (err) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading schedules...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="content">
      <div>
        <h2>Daily Collections</h2>
        <br />
        <br />
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Today Collections</h3>
        </div>

        <DataTable
          columns={["Day", "Time", "Hotel", "Status", "Action"]}
          rows={collections.map((item) => {
            const [hours, minutes] = item.time.split(":").map(Number);
            const scheduledMinutes = hours * 60 + minutes;

            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const isLate = currentMinutes > scheduledMinutes + 15;

            return {
              Day: item.day,
              Time: item.time,
              Hotel:
                hotels.find((h) => h.hotel_id === item.hotel)?.name ||
                "Unknown",
              Status: item.status,
              Action: (
                <button
                  className="btn btn-success"
                  onClick={() => handleComplete(item.schedule_id)}
                >
                  Complete
                </button>
              ),
              rowClassName: isLate ? "table-danger" : "",
            };
          })}
        />
      </div>
    </div>
  );
};

export default Scheduling;
