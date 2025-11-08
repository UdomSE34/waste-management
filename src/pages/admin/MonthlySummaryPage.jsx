import { useState, useEffect } from "react";
import DataTable from "../../components/admin/DataTable";
import {
  fetchMonthlySummaries,
  generateMonthlySummary,
  updateMonthlySummary,
  downloadWasteReport,
  downloadPaymentReport,
} from "../../services/admin/monthlySummaryService";

const MonthlySummaryDashboard = () => {
  const [summaries, setSummaries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState(null);
  const [processedWaste, setProcessedWaste] = useState(0);
  const [processedPayment, setProcessedPayment] = useState(0);
  const [wasteReportFile, setWasteReportFile] = useState(null);
  const [paymentReportFile, setPaymentReportFile] = useState(null);

  // Load current month on mount
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setSelectedMonth(currentMonth);
    loadSummaries(currentMonth);
  }, []);

  const loadSummaries = async (month) => {
    if (!month) return;
    setLoading(true);
    setError("");
    try {
      const generated = await generateMonthlySummary(month);
      const data = await fetchMonthlySummaries(month);
      setSummaries(data.length ? data : generated ? [generated] : []);
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

  const openEditModal = (summary) => {
    setEditingSummary(summary);
    setProcessedWaste(summary.total_processed_waste || 0);
    setProcessedPayment(summary.total_processed_payment || 0);
    setWasteReportFile(null);
    setPaymentReportFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingSummary) return;
    setLoading(true);
    setError("");
    try {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append("total_processed_waste", processedWaste);
      formData.append("total_processed_payment", processedPayment);
      if (wasteReportFile)
        formData.append("processed_waste_report", wasteReportFile);
      if (paymentReportFile)
        formData.append("processed_payment_report", paymentReportFile);

      const updated = await updateMonthlySummary(
        editingSummary.summary_id,
        formData,
        true
      );

      setSummaries((prev) =>
        prev.map((s) => (s.summary_id === updated.summary_id ? updated : s))
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to update summary:", err);
      setError("Failed to update summary. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Dashboard totals
  const totalActualWaste = summaries.reduce(
    (acc, s) => acc + (s.total_actual_waste || 0),
    0
  );
  const totalProcessedWaste = summaries.reduce(
    (acc, s) => acc + (s.total_processed_waste || 0),
    0
  );
  const totalActualPayment = summaries.reduce(
    (acc, s) => acc + Number(s.total_actual_payment || 0),
    0
  );
  const totalProcessedPayment = summaries.reduce(
    (acc, s) => acc + Number(s.total_processed_payment || 0),
    0
  );

  return (
    <div className="content">
      <div className="page-header">
        <h2>Monthly Summary Dashboard</h2>
        <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
          <button
            className="btn btn-outline"
            onClick={() => downloadWasteReport(selectedMonth)}
            disabled={!selectedMonth || loading}
          >
            Download Waste Report (PDF)
          </button>
          <button
            className="btn btn-outline"
            onClick={() => downloadPaymentReport(selectedMonth)}
            disabled={!selectedMonth || loading}
          >
            Download Payment Report (PDF)
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Dashboard Cards */}
      <div
        className="dashboard-cards"
        style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
      >
        <div className="card">
          <div className="card-header">
            <h3>Actual Waste (kg)</h3>
          </div>
          <h4>{totalActualWaste.toLocaleString()}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Processed Waste (kg)</h3>
          </div>
          <h4>{totalProcessedWaste.toLocaleString()}</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Actual Payments</h3>
          </div>
          <h4>{totalActualPayment.toLocaleString()}Tsh</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Processed Payments</h3>
          </div>
          <h4>{totalProcessedPayment.toLocaleString()}Tsh</h4>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-header">
          <h3>Monthly Summaries</h3>
          <div
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <label style={{ marginRight: "0.5rem" }}>Filter by Month:</label>
            <input
              type="month"
              className="filter-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              disabled={loading}
            />
          </div>
        </div>
        <DataTable
          columns={[
            "Month",
            "Actual Waste (kg)",
            "Processed Waste (kg)",
            "Actual Payment",
            "Processed Payment",
            "Actions",
          ]}
          rows={summaries.map((s) => ({
            Month: new Date(s.month).toLocaleString("default", {
              month: "short",
              year: "numeric",
            }),
            "Actual Waste (kg)": (
              s.total_actual_waste || 0
            ).toLocaleString(),
            "Processed Waste (kg)": (
              s.total_processed_waste || 0
            ).toLocaleString(),
            "Actual Payment": `${(
              s.total_actual_payment || 0
            ).toLocaleString()}Tsh`,
            "Processed Payment": `${(
              s.total_processed_payment || 0
            ).toLocaleString()}Tsh`,
            Actions: (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                
                {s.processed_waste_report && (
                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      window.open(s.processed_waste_report, "_blank")
                    }
                  >
                  Waste
                  </button>
                )}
                {s.processed_payment_report && (
                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      window.open(s.processed_payment_report, "_blank")
                    }
                  >
                  Payment
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => openEditModal(s)}
                >
                  Edit
                </button>
              </div>
            ),
          }))}
        />
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Processed Data</h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="form-group">
                <label>Processed Waste (kg)</label>
                <input
                  type="number"
                  value={processedWaste}
                  onChange={(e) => setProcessedWaste(Number(e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Processed Payment ($)</label>
                <input
                  type="number"
                  value={processedPayment}
                  onChange={(e) => setProcessedPayment(Number(e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Upload Waste Report (PDF)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setWasteReportFile(e.target.files[0] || null)
                  }
                />
              </div>
              <div className="form-group">
                <label>Upload Payment Report (PDF)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setPaymentReportFile(e.target.files[0] || null)
                  }
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySummaryDashboard;
