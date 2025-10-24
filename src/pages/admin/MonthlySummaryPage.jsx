import { useState, useEffect } from "react";
import DataTable from "../../components/admin/DataTable";
import {
  fetchMonthlySummaries,
  updateMonthlySummary,
  addMonthlySummary,
  generateMonthlySummaries,
} from "../../services/admin/monthlySummaryService";

const MonthlySummaryDashboard = () => {
  const [summaries, setSummaries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Edit Modal State ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [newProcessedWaste, setNewProcessedWaste] = useState("");
  const [newProcessedPayment, setNewProcessedPayment] = useState("");

  // --- Add Modal State ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [addClientId, setAddClientId] = useState("");
  const [addMonth, setAddMonth] = useState("");
  const [addWaste, setAddWaste] = useState("");
  const [addPayment, setAddPayment] = useState("");

  // Load current month on mount
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setSelectedMonth(currentMonth);
    loadSummaries(currentMonth);
  }, []);

  // --- Load Summaries with Auto-Generation ---
  const loadSummaries = async (month) => {
    if (!month) return;
    setLoading(true);
    setError("");
    try {
      // Auto-generate summaries first
      await generateMonthlySummaries(month);

      // Fetch summaries after generation
      const data = await fetchMonthlySummaries(month);
      setSummaries(data);
    } catch (err) {
      console.error("Failed to load monthly summaries:", err);
      setError("Failed to load summaries. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = async (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    await loadSummaries(month);
  };

  // --- Edit Summary ---
  const openEditModal = (summary) => {
    setCurrentSummary(summary);
    setNewProcessedWaste(summary.processed_waste || 0);
    setNewProcessedPayment(summary.processed_payment || 0);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        total_waste_litres: parseFloat(newProcessedWaste),
        total_amount_paid: parseFloat(newProcessedPayment),
      };
      const updated = await updateMonthlySummary(currentSummary.summary_id, payload);

      // Update local state
      setSummaries((prev) =>
        prev.map((s) =>
          s.summary_id === updated.summary_id
            ? {
                ...s,
                processed_waste: updated.total_waste_litres,
                processed_payment: updated.total_amount_paid,
              }
            : s
        )
      );
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update summary:", err);
      alert("Failed to update summary");
    }
  };

  // --- Add Summary Manually ---
  const handleAddSummary = async () => {
    try {
      const payload = {
        client: addClientId,
        month: addMonth,
        total_waste_litres: parseFloat(addWaste),
        total_amount_paid: parseFloat(addPayment),
      };
      const newSummary = await addMonthlySummary(payload);

      setSummaries((prev) => [newSummary, ...prev]);
      setShowAddModal(false);
      setAddClientId("");
      setAddMonth("");
      setAddWaste("");
      setAddPayment("");
    } catch (err) {
      console.error("Failed to add summary:", err);
      alert("Failed to add summary");
    }
  };

  // --- Dashboard Totals ---
  const totalActualWaste = summaries.reduce((acc, s) => acc + (s.actual_waste || 0), 0);
  const totalProcessedWaste = summaries.reduce((acc, s) => acc + (s.processed_waste || 0), 0);
  const totalActualPayment = summaries.reduce((acc, s) => acc + (s.actual_payment || 0), 0);
  const totalProcessedPayment = summaries.reduce((acc, s) => acc + (s.processed_payment || 0), 0);

  return (
    <div className="content">
      <h2>Monthly Hotel Summary Dashboard</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter & Add */}
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}>
        <label style={{ marginRight: "0.5rem" }}>Filter by Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
          style={{ marginLeft: "1rem" }}
          disabled={loading}
        >
          Add Summary
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards" style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div className="card">
          <div className="card-header"><h3>Actual Waste (L)</h3></div>
          <h4>{totalActualWaste.toFixed(2)} L</h4>
        </div>
        <div className="card">
          <div className="card-header"><h3>Processed Waste (L)</h3></div>
          <h4>{totalProcessedWaste.toFixed(2)} L</h4>
        </div>
        <div className="card">
          <div className="card-header"><h3>Actual Payments</h3></div>
          <h4>${totalActualPayment.toFixed(2)}</h4>
        </div>
        <div className="card">
          <div className="card-header"><h3>Processed Payments</h3></div>
          <h4>${totalProcessedPayment.toFixed(2)}</h4>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={["Hotel Name", "Actual Waste (L)", "Processed Waste (L)", "Actual Payment", "Processed Payment", "Actions"]}
        rows={summaries.map((s) => ({
          "Hotel Name": s.hotel_name,
          "Actual Waste (L)": (s.actual_waste || 0).toFixed(2),
          "Processed Waste (L)": (s.processed_waste || 0).toFixed(2),
          "Actual Payment": `$${(s.actual_payment || 0).toFixed(2)}`,
          "Processed Payment": `$${(s.processed_payment || 0).toFixed(2)}`,
          "Actions": (
            <button
              className="btn btn-warning btn-sm"
              onClick={() => openEditModal(s)}
              disabled={loading}
            >
              Edit
            </button>
          ),
        }))}
      />

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Processed Summary</h3>
            <p>Hotel: {currentSummary.hotel_name}</p>
            <input
              type="number"
              value={newProcessedWaste}
              onChange={(e) => setNewProcessedWaste(e.target.value)}
              placeholder="Processed Waste (L)"
            />
            <input
              type="number"
              value={newProcessedPayment}
              onChange={(e) => setNewProcessedPayment(e.target.value)}
              placeholder="Processed Payment"
            />
            <div style={{ marginTop: "1rem" }}>
              <button className="btn btn-primary" onClick={handleUpdate}>Save</button>
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)} style={{ marginLeft: "0.5rem" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Monthly Summary</h3>
            <input
              type="text"
              value={addClientId}
              onChange={(e) => setAddClientId(e.target.value)}
              placeholder="Client ID"
            />
            <input
              type="month"
              value={addMonth}
              onChange={(e) => setAddMonth(e.target.value)}
              placeholder="Month"
            />
            <input
              type="number"
              value={addWaste}
              onChange={(e) => setAddWaste(e.target.value)}
              placeholder="Total Waste (L)"
            />
            <input
              type="number"
              value={addPayment}
              onChange={(e) => setAddPayment(e.target.value)}
              placeholder="Total Payment"
            />
            <div style={{ marginTop: "1rem" }}>
              <button className="btn btn-primary" onClick={handleAddSummary}>Add</button>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} style={{ marginLeft: "0.5rem" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySummaryDashboard;
