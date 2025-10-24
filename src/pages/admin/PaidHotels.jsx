import { useState, useEffect } from "react";
import {
  getPaidHotels,
  markHotelAsPaid,
  markHotelAsUnpaid,
  exportPaidHotels,
  deletePaidHotel, // new delete function
} from "../../services/admin/PaidHotelService";
import DataTable from "../../components/admin/DataTable";
import "../../css/admin/SalaryManagement.css";

const PaidHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await getPaidHotels();
        setHotels(data);
        setFilteredHotels(data);
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
      setLoading(true);
      const updated =
        currentStatus === "Paid"
          ? await markHotelAsUnpaid(id)
          : await markHotelAsPaid(id);

      setHotels((prev) =>
        prev.map((h) => (h.paid_hotel_id === id ? updated : h))
      );
      applyFilters();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Status update failed.");
    } finally {
      setLoading(false);
    }
  };

  // Delete hotel record using Axios service
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      setLoading(true);
      await deletePaidHotel(id);
      setHotels((prev) => prev.filter((h) => h.paid_hotel_id !== id));
      applyFilters();
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  // Apply month & status filters
  const applyFilters = () => {
    let filtered = [...hotels];
    if (filterMonth) {
      filtered = filtered.filter(
        (h) => h.month && h.month.startsWith(filterMonth) // YYYY-MM
      );
    }
    if (filterStatus) {
      filtered = filtered.filter((h) => h.status === filterStatus);
    }
    setFilteredHotels(filtered);
  };

  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
    setTimeout(applyFilters, 0);
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setTimeout(applyFilters, 0);
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
              <h4>{filteredHotels.length}</h4>
            </div>
            <div className="card">
              <div className="card-header">
                <h3>Paid</h3>
              </div>
              <h4>
                {filteredHotels.filter((h) => h.status === "Paid").length}
              </h4>
            </div>
            <div className="card">
              <div className="card-header">
                <h3>Unpaid</h3>
              </div>
              <h4>
                {filteredHotels.filter((h) => h.status === "Unpaid").length}
              </h4>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Hotels List</h3>
              <div className="filters">
                <label>
                  Filter by Month:
                  <input className="filter-select"
                    type="month"
                    value={filterMonth}
                    onChange={handleMonthChange}
                  />
                </label>

                <label>
                  Filter by Status:
                  <select className="filter-select" value={filterStatus} onChange={handleStatusChange}>
                    <option value="">All</option>
                    <option value="Unpaid">Paid</option>
                    <option value="Paid">Unpaid</option>
                  </select>
                </label>
              </div>
              {/* <button
                className="btn btn-secondary"
                onClick={() => setShowExportOptions(true)}
              >
                Export PDF
              </button> */}
            </div>

            <DataTable
              columns={[
                "Name",
                "Address",
                "Contact",
                "Hadhi",
                "Currency",
                "Account",
                "Month",
                "Status",
                "Actions",
              ]}
              rows={filteredHotels.map((hotel) => ({
                Name: hotel.name,
                Address: hotel.address,
                Contact: hotel.contact_phone,
                Hadhi: hotel.hadhi,
                Currency: hotel.currency,
                Account: hotel.payment_account,
                Month: hotel.month ? hotel.month.substring(0, 7) : "",
                Status: hotel.status,
                Actions: (
                  <>
                    <button
                      className={`btn ${
                        hotel.status === "Paid" ? "btn-outline" : "btn-outline"
                      }`}
                      onClick={() =>
                        handleToggleStatus(hotel.paid_hotel_id, hotel.status)
                      }
                    >
                      {hotel.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}
                    </button>
                    <button
                      className="btn btn-danger btn-danger"
                      onClick={() => handleDelete(hotel.paid_hotel_id)}
                    >
                      Delete
                    </button>
                  </>
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
