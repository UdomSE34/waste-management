import { useState, useEffect } from "react";
import DataTable from "../../components/client/DataTable";
import "../../css/client/Schedulling.css";

// Services
import { getCollections } from "../../services/client/ScheduleService";
import hotelService from "../../services/client/hotelService"; // default import

const ClientScheduling = () => {
  const [collections, setCollections] = useState([]);
  const [,setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientId = localStorage.getItem("userId");
        console.log("Logged-in Client ID:", clientId); // for testing

        // Fetch all collections and hotels
        const [collectionsRes, hotelsRes] = await Promise.all([
          getCollections(),
          hotelService.getPendingHotels(),
        ]);

        // Filter hotels that belong to the current client
        const clientHotels = hotelsRes.data
          ? hotelsRes.data.filter((hotel) => hotel.client === clientId)
          : [];
        setHotels(clientHotels);

        // Filter collections:
        // Only include collections where hotel_name matches a hotel the client owns
        const clientCollections = collectionsRes.filter((col) =>
          clientHotels.some((hotel) => hotel.name === col.hotel_name)
        );

        setCollections(clientCollections);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching scheduling data:", err);
        setError(err.message || "Failed to load scheduling data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading scheduling data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Transform collections for DataTable
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
        <h2>My Hotel Collections</h2>
      </div>
      <br />

      <div className="card">
        <div className="card-header">
          <h3>Collections</h3>
        </div>
        <DataTable
          columns={["Day", "Start Time", "End Time", "Hotel", "Status"]}
          rows={rows}
        />
      </div>
    </div>
  );
};

export default ClientScheduling;
