import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  fetchInvoices,
  sendInvoice,
  generateInvoicesForMonth, // generate default invoices for month
} from "../services/admin/invoiceService";
import { fetchHotels } from "../services/admin/hotelService";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  ); // default current month
  const [statusFilter, setStatusFilter] = useState(""); // "" = all

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [activeHotel, setActiveHotel] = useState(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load hotels once
  useEffect(() => {
    loadHotels();
  }, []);

  // Load invoices whenever month changes
  useEffect(() => {
    if (selectedMonth) loadInvoices(selectedMonth);
  }, [selectedMonth]);

  // Fetch hotels
  const loadHotels = async () => {
    try {
      const data = await fetchHotels();
      setHotels(data);
    } catch (err) {
      console.error("Failed to load hotels:", err);
      setError("Failed to load hotels.");
    }
  };

  // Load invoices and generate defaults for the month
  const loadInvoices = async (month) => {
    setLoading(true);
    setError("");
    try {
      // Convert selectedMonth ("YYYY-MM") to year/month numbers
      const [year, monthNum] = month.split("-").map(Number);

      // Generate invoices for the selected month if missing
      await generateInvoicesForMonth({ year, month: monthNum });

      // Fetch all invoices after generation
      const data = await fetchInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setError("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  // Month filter
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Status filter
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  // Filter invoices by month & status
  const filteredInvoices = invoices.filter((i) => {
    const matchesMonth =
      !selectedMonth ||
      `${i.year}-${String(i.month).padStart(2, "0")}` === selectedMonth;

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "not_received" ? !i.is_received : i.status === statusFilter);

    return matchesMonth && matchesStatus;
  });

  // Compute dashboard stats based on filtered invoices
  const stats = {
    sent: filteredInvoices.filter((i) => i.status === "sent").length,
    notSent: filteredInvoices.filter((i) => i.status === "not_sent").length,
    received: filteredInvoices.filter((i) => i.status === "received" || i.is_received).length,
    notReceived: filteredInvoices.filter((i) => !(i.status === "received" || i.is_received)).length,
  };

  // Open modal to send invoice
  const openModal = (invoiceId, hotel, invoiceAmount) => {
    setActiveInvoiceId(invoiceId);
    setActiveHotel(hotel);
    setAmount(invoiceAmount || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveInvoiceId(null);
    setActiveHotel(null);
    setAmount("");
  };

  const handleSendInvoice = async () => {
    if (!activeInvoiceId || !activeHotel) return alert("No invoice selected.");
    if (!amount) return alert("Please enter an amount.");

    const [year, month] = selectedMonth.split("-");

    setSubmitting(true);
    try {
      await sendInvoice(activeInvoiceId, {
        amount,
        month: parseInt(month),
        year: parseInt(year),
      });
      alert("✅ Invoice sent successfully!");
      closeModal();
      loadInvoices(selectedMonth);
    } catch (err) {
      console.error("Error sending invoice:", err);
      alert("❌ Failed to send invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>Invoices Management</h2>
      </div>

      {/* Dashboard Cards */}
      <div
        className="dashboard-cards"
        style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
      >
        <div className="card">
          <div className="card-header">
            <h3>Sent Invoices</h3>
          </div>
          <h4>{stats.sent}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Not Sent</h3>
          </div>
          <h4>{stats.notSent}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Received Invoices</h3>
          </div>
          <h4>{stats.received}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Not Received</h3>
          </div>
          <h4>{stats.notReceived}</h4>
        </div>
      </div>

      
      {/* Invoices Table */}
      <div className="card">
        <div className="card-header">
          <h3>Customer Invoices</h3>

          {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label>Filter by Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            disabled={loading}
            className="filter-select"
          />
        </div>

        <div>
          <label>Filter by Status:</label>
          <select className="filter-select" value={statusFilter} onChange={handleStatusFilter}>
            <option value="">All</option>
            <option value="not_sent">Not Sent</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
            <option value="not_received">Not Received</option>
          </select>
        </div>
      </div>

        </div>
        {loading ? (
          <div className="loading-indicator">Loading invoices...</div>
        ) : filteredInvoices.length > 0 ? (
          <DataTable
            columns={["Hotel", "Amount", "Month", "Status", "Action"]}
            rows={filteredInvoices.map((inv) => ({
              Hotel:
                inv.hotel_name ||
                hotels.find((h) => h.id === inv.hotel)?.name ||
                "-",
              Amount: `Tsh ${Number(inv.amount).toLocaleString()}`,
              Month: `${inv.year}-${String(inv.month).padStart(2, "0")}`,
              Status: (
                <span
                  className={`status-badge ${
                    inv.status === "sent"
                      ? "sent"
                      : inv.status === "received" || inv.is_received
                      ? "received"
                      : "pending"
                  }`}
                >
                  {inv.is_received ? "received" : inv.status}
                </span>
              ),
              Action: (
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    openModal(
                      inv.invoice_id,
                      hotels.find((h) => h.id === inv.hotel) || inv.hotel,
                      inv.amount
                    )
                  }
                >
                  Send Invoice
                </button>
              ),
            }))}
          />
        ) : (
          <div className="no-data">No invoices found.</div>
        )}
      </div>

      {/* Send Invoice Modal */}
      {showModal && activeHotel && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Send Invoice</h3>
              <button className="btn-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* <div className="form-group">
                <label>Hotel Name:</label>
                <input type="text" value={activeHotel.hotel_name} readOnly />
              </div> */}

              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleSendInvoice}
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Invoice"}
              </button>
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .status-badge {
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          text-transform: capitalize;
        }
        .status-badge.sent { background: #cce5ff; color: #004085; }
        .status-badge.received { background: #d4edda; color: #155724; }
        .status-badge.pending { background: #fff3cd; color: #856404; }
        .dashboard-cards .card {
          flex: 1;
          padding: 1rem;
          border-radius: 8px;
          background: #f8f9fa;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Invoices;
