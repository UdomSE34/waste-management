import { useState, useEffect } from "react";
import {
  getPendingHotels,
  approvePendingHotel,
  rejectPendingHotel,
  exportPendingHotels,
  updatePendingHotel,
  deletePendingHotel,
} from "../services/pendingHotelServices";
import DataTable from "../components/DataTable";
import "../css/Hotels.css";

const PendingHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Edit state
  const [editHotel, setEditHotel] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await getPendingHotels();
        const transformed = Array.isArray(data)
          ? data.map((hotel) => ({
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
            }))
          : [];
        setHotels(transformed);
        setError(null);
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError(err.message || "Failed to load hotels.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Approve / Reject handlers
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this hotel?")) return;
    try {
      await approvePendingHotel(id);
      setHotels((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status: "approved" } : h))
      );
      alert("Hotel approved successfully!");
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Failed to approve hotel.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this hotel?")) return;
    try {
      await rejectPendingHotel(id);
      setHotels((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status: "rejected" } : h))
      );
      alert("Hotel rejected.");
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Failed to reject hotel.");
    }
  };

  // Edit and Delete for hotels
  const openEditModal = (hotel) => {
    setEditHotel(hotel);
    setEditForm(hotel);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePendingHotel(editHotel.id, editForm);
      setHotels((prev) =>
        prev.map((h) => (h.id === editHotel.id ? { ...h, ...editForm } : h))
      );
      alert("Hotel updated successfully!");
      setEditHotel(null);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update hotel.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;
    try {
      await deletePendingHotel(id);
      setHotels((prev) => prev.filter((h) => h.id !== id));
      alert("Hotel deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete hotel.");
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

  const pendingHotels = hotels.filter((h) => h.status === "pending");
  const allHotels = hotels.filter((h) => h.status !== "pending");

  return (
    <div className="content">
      <div className="page-header">
        <h2>Pending Hotels</h2>
      </div>
      <br />

      {loading && <div className="loading-indicator">Loading hotels...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-header">
                <h3>Total Pending</h3>
              </div>
              <h4>{pendingHotels.length}</h4>
              <p>Waiting for staff approval</p>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Total Hotels</h3>
              </div>
              <h4>{allHotels.length}</h4>
              <p>Approved or Rejected Hotels</p>
            </div>
          </div>

          {/* Pending Hotels Table */}
          <div className="card">
            <div className="card-header">
              <h3>Pending Hotels</h3>
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

          {/* All Hotels Table */}
          <div className="card">
            <div className="card-header">
              <h3>All Hotels</h3>
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
                "Status",
                "Actions",
              ]}
              rows={allHotels.map((hotel) => ({
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
                Status: hotel.status,
                Actions: (
                  <div className="hotel-actions">
                    <button
                      className="btn btn-outline"
                      onClick={() => openEditModal(hotel)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(hotel.id)}
                    >
                      Delete
                    </button>
                  </div>
                ),
              }))}
            />
          </div>

          {/* Edit Modal */}
          {editHotel && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Edit Hotel</h3>
                  <span
                    className="close-modal"
                    onClick={() => setEditHotel(null)}
                  >
                    &times;
                  </span>
                </div>

                <form onSubmit={handleEditSubmit} className="edit-form">
                  <label>Name</label>
                  <input
                    type="text"
                    className="form-group"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />

                  <label>Address</label>
                  <input
                    type="text"
                    className="form-group"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    required
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    className="form-group"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    required
                  />

                  <label>Contact Phone</label>
                  <input
                    type="text"
                    className="form-group"
                    value={editForm.contact_phone}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        contact_phone: e.target.value,
                      })
                    }
                  />

                  <div className="modal-footer">
                    <button type="submit" className="btn btn-success">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditHotel(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingHotels;
