import { useState, useEffect } from "react";
import {
  getPaidHotels,
  markHotelAsPaid,
  markHotelAsUnpaid,
  exportPaidHotels,
} from "../../services/admin/PaidHotelService";
import DataTable from "../../components/admin/DataTable";
import "../../css/admin/SalaryManagement.css";

const PaidHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await getPaidHotels();
        setHotels(data);
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError("Failed to load hotels.");
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  // Toggle hotel payment status
const handleToggleStatus = async (id, currentStatus) => {
  if (!window.confirm(`Change status of this hotel?`)) return;
  try {
    setLoading(true); // optional: show loading state
    const updated =
      currentStatus === "Paid"
        ? await markHotelAsUnpaid(id)
        : await markHotelAsPaid(id);

    setHotels((prev) =>
      prev.map((h) => (h.paid_hotel_id === id ? updated : h))
    );

    if (currentStatus !== "Paid") {
      alert("Hotel marked as Paid. Notifications sent to customer.");
    }
  } catch (err) {
    console.error("Failed to update status:", err);
    alert("Status update failed.");
  } finally {
    setLoading(false);
  }
};

  // Export PDF
  const handleExport = async () => {
    try {
      const blob = await exportPaidHotels("pdf");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "paid_hotels.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setShowExportOptions(false);
    } catch (err) {
      console.error("Failed to export:", err);
      alert("Export failed.");
    }
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>Hotels Payment Status</h2>
      </div>
      <br />

      {loading && <div className="loading-indicator">Loading hotels...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      {!loading && !error && (
        <>
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-header">
                <h3>Total Hotels</h3>
              </div>

              <h4>{hotels.length}</h4>
            </div>
            <div className="card">
              <div className="card-header">
                <h3>Paid</h3>
              </div>

              <h4>{hotels.filter((h) => h.status === "Paid").length}</h4>
            </div>
            <div className="card">
              <div className="card-header">
                <h3>Unpaid</h3>
              </div>

              <h4>{hotels.filter((h) => h.status === "Unpaid").length}</h4>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Hotels List</h3>
              <button
                className="btn btn-secondary"
                onClick={() => setShowExportOptions(true)}
              >
                Export PDF
              </button>
            </div>

            <DataTable
              columns={[
                "Name",
                "Address",
                "Contact",
                "Hadhi",
                "Currency",
                "Account",
                "Status",
                "Actions",
              ]}
              rows={hotels.map((hotel) => ({
                Name: hotel.name,
                Address: hotel.address,
                Contact: hotel.contact_phone,
                Hadhi: hotel.hadhi,
                Currency: hotel.currency,
                Account: hotel.payment_account,
                Status: hotel.status,
                Actions: (
                  <button
                    className={`btn ${
                      hotel.status === "Paid" ? "btn-danger" : "btn-primary"
                    }`}
                    onClick={() =>
                      handleToggleStatus(hotel.paid_hotel_id, hotel.status)
                    }
                  >
                    {hotel.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}
                  </button>
                ),
              }))}
            />
          </div>

          {showExportOptions && (
            <div className="modal">
              <div className="modal-content">
                <span
                  className="close-modal"
                  onClick={() => setShowExportOptions(false)}
                >
                  &times;
                </span>
                <button className="btn btn-outline" onClick={handleExport}>
                  Export PDF
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaidHotels;
