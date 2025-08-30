import { useState, useEffect } from "react";
import {
  getPendingHotels,
  approvePendingHotel,
  rejectPendingHotel,
  exportPendingHotels,
} from "../services/pendingHotelServices";
import DataTable from "../components/DataTable";
import "../css/Hotels.css";

const PendingHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    const fetchPendingHotels = async () => {
      try {
        const data = await getPendingHotels();
        if (!Array.isArray(data)) {
          setError("Invalid data format from server");
          setHotels([]);
          return;
        }
        const transformed = data.map((hotel) => ({
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
          collection_times_per_week: hotel.collection_times_per_week,
          currency: hotel.currency,
          payment_account: hotel.payment_account,
          status: hotel.status,
        }));
        setHotels(transformed);
        setError(null);
      } catch (err) {
        console.error("Error fetching pending hotels:", err);
        setError(err.message || "Failed to load pending hotels.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingHotels();
  }, []);

  // Approve a hotel
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this hotel?")) return;
    try {
      await approvePendingHotel(id);
      setHotels((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, status: "approved" } : h
        )
      );
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Failed to approve hotel.");
    }
  };

  // Reject a hotel
  const handleReject = async (id) => {
    if (!window.confirm("Reject this hotel?")) return;
    try {
      await rejectPendingHotel(id);
      setHotels((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, status: "rejected" } : h
        )
      );
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Failed to reject hotel.");
    }
  };

  // Export data
  const handleExport = async (format) => {
    try {
      const blob = await exportPendingHotels(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pending_hotels.${format}`;
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

  // Filter pending hotels for table display
  const pendingHotels = hotels.filter((h) => h.status === "pending");

  return (
    <div className="content">
      <div className="page-header">
        <h2>Pending Hotels</h2>
      </div>
      <br />

      {loading && <div className="loading-indicator">Loading pending hotels...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-header">
                <h3>Total Pending</h3>
                <span><i className="bi bi-hourglass-split"></i></span>
              </div>
              <h4>{hotels.filter((h) => h.status === "pending").length}</h4>
              <p>Waiting for staff approval</p>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Approved Hotels</h3>
                <span><i className="bi bi-check2-circle"></i></span>
              </div>
              <h4>{hotels.filter((h) => h.status === "approved").length}</h4>
              <p>Hotels that have been approved</p>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Rejected Hotels</h3>
                <span><i className="bi bi-x-circle"></i></span>
              </div>
              <h4>{hotels.filter((h) => h.status === "rejected").length}</h4>
              <p>Hotels that have been rejected</p>
            </div>
          </div>

          {/* Pending Hotels Table */}
          <div className="card">
            <div className="card-header">
              <h3>Pending Hotels</h3>
              <div className="header-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowExportOptions(true)}
                >
                  Export Data
                </button>
              </div>
            </div>

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
                "Actions",
              ]}
              rows={pendingHotels.map((hotel) => ({
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
                Actions: (
                  <div className="hotel-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleApprove(hotel.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(hotel.id)}
                    >
                      Reject
                    </button>
                  </div>
                ),
              }))}
            />
          </div>

          {/* Export Options Modal */}
          {showExportOptions && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Export Pending Hotels</h3>
                  <span
                    className="close-modal"
                    onClick={() => setShowExportOptions(false)}
                  >
                    &times;
                  </span>
                </div>
                <div className="export-options">
                  <p>Select export format:</p>
                  <div className="export-buttons">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleExport("csv")}
                    >
                      CSV
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleExport("xlsx")}
                    >
                      Excel
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleExport("pdf")}
                    >
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingHotels;
