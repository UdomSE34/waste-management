import { useState, useEffect } from "react";
import DataTable from "../../components/client/DataTable";
import "../../css/client/Schedulling.css";

// Services
import { getCollections } from "../../services/client/ScheduleService";
import hotelService from "../../services/client/hotelService"; // default import

const ClientScheduling = () => {
  const [collections, setCollections] = useState([]);
  const [, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientId = localStorage.getItem("userId");
        console.log("Logged-in Client ID:", clientId);

        // Fetch collections and hotels in parallel
        const [collectionsRes, hotelsRes] = await Promise.all([
          getCollections(),
          hotelService.getPendingHotels(),
        ]);

        console.log("All Collections:", collectionsRes);
        console.log("All Hotels:", hotelsRes);

        // Filter hotels owned by this client
        const clientHotels = hotelsRes.filter((hotel) => hotel.client === clientId);
        setHotels(clientHotels);

        console.log("Client Hotels:", clientHotels);

        // Filter collections that belong to client's hotels
        const clientCollections = collectionsRes.filter((col) =>
          clientHotels.some(
            (hotel) =>
              (hotel.name?.trim().toLowerCase() || "") ===
              (col.hotel_name?.trim().toLowerCase() || "")
          )
        );

        console.log("Client Collections:", clientCollections);

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
    "Time Range": item.slot,
    Hotel: item.hotel_name,
    Status: item.status,
  }));

  return (
    <div className="content">
      <div className="page-header">
        <h2>Collections</h2>
      </div>
      <br />

      <div className="card">
        <div className="card-header">
          <h3>Collections</h3>
        </div>
        <DataTable columns={["Day", "Time Range", "Hotel", "Status"]} rows={rows} />
      </div>
    </div>
  );
};

export default ClientScheduling;
