import { useState, useEffect } from "react";
import { getPendingHotels } from "../../services/client/pendingHotelServices";
import DataTable from "../../components/client/DataTable";

const ClientPendingHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clientId = localStorage.getItem("userId"); // logged-in client ID
  console.log("Logged-in Client ID:", clientId);

  const fetchPendingHotels = async () => {
    setLoading(true);
    try {
      const data = await getPendingHotels();
      if (!Array.isArray(data)) {
        setError("Invalid data format from server");
        setHotels([]);
        return;
      }
      // Only show hotels belonging to the logged-in client
      const clientHotels = data
        .filter((hotel) => hotel.client === clientId)
        .map((hotel) => ({
          id: hotel.id,
          name: hotel.name,
          address: hotel.address,
          email: hotel.email,
          contact_phone: hotel.contact_phone,
          hadhi: hotel.hadhi,
          total_rooms: hotel.total_rooms,
          type: hotel.type,
          waste_per_day: hotel.waste_per_day,
          collection_frequency: hotel.collection_frequency,
          currency: hotel.currency,
          payment_account: hotel.payment_account,
          status: hotel.status, // include status
        }));

      setHotels(clientHotels);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending hotels:", err);
      setError(err.message || "Failed to load pending hotels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingHotels();
  }, []);

  return (
    <div className="content">
      <div className="page-header">
        <h2>Pending Hotels</h2>
      </div>
      <br />

      {loading && <div className="loading-indicator">Loading hotels...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      {!loading && !error && (
        <div className="card">
          <DataTable
            columns={[
              "Name",
              "Address",
              "Contact",
              "Email",
              "Hadhi",
              "Rooms",
              "Type",
              "Waste/Day",
              "Collection Freq.",
              "Currency",
              "Account",
              "Status", // added status column
            ]}
            rows={hotels.map((hotel) => ({
              Name: hotel.name,
              Address: hotel.address,
              Contact: hotel.contact_phone,
              Email: hotel.email,
              Hadhi: hotel.hadhi,
              Rooms: hotel.total_rooms,
              Type: hotel.type,
              "Waste/Day": hotel.waste_per_day,
              "Collection Freq.": hotel.collection_frequency,
              Currency: hotel.currency,
              Account: hotel.payment_account,
              Status: hotel.status, // show status
            }))}
          />
        </div>
      )}
    </div>
  );
};

export default ClientPendingHotels;
