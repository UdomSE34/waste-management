import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import {
  fetchPaymentSlips,
  addPaymentSlip,
  updatePaymentSlip,
  deletePaymentSlip,
  getFileUrl,
} from "../../services/client/paymentSlipService";

const PaymentSlips = () => {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeSlip, setActiveSlip] = useState(null);

  const [newSlip, setNewSlip] = useState({
    client: "",
    month_paid: "",
    status: "current",
    comment: "",
    file: null,
  });

  const [editSlip, setEditSlip] = useState({
    slip_id: "",
    month_paid: "",
    status: "current",
    comment: "",
    file: null,
  });

  const navigate = useNavigate();
  const clearMessages = () => { setError(""); setSuccess(""); };

  // Prefill client
  useEffect(() => {
    const clientId = localStorage.getItem("userId");
    if (!clientId) {
      alert("You must log in to access this page.");
      navigate("/login");
      return;
    }
    setNewSlip((prev) => ({ ...prev, client: clientId }));
  }, [navigate]);

  // Load slips
  useEffect(() => { loadSlips(); }, []);

  const loadSlips = async () => {
    clearMessages();
    setLoading(true);
    try {
      const clientId = localStorage.getItem("userId");
      const data = await fetchPaymentSlips();
      const clientSlips = Array.isArray(data)
        ? data.filter((s) => String(s.client) === String(clientId))
        : [];
      setSlips(clientSlips);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load payment slips.");
    } finally { setLoading(false); }
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value, files } = e.target;
    const val = name === "file" ? files[0] : value;
    if (isEdit) setEditSlip((prev) => ({ ...prev, [name]: val }));
    else setNewSlip((prev) => ({ ...prev, [name]: val }));
  };

  const handleAddSlip = async (e) => {
    e.preventDefault();
    clearMessages();
    setBtnLoading(true);
    try {
      const formData = new FormData();
      let formattedMonth = newSlip.month_paid;
      if (formattedMonth?.length === 7) formattedMonth = `${formattedMonth}-01`;
      formData.append("client", newSlip.client);
      formData.append("month_paid", formattedMonth);
      formData.append("status", newSlip.status);
      formData.append("comment", newSlip.comment);
      if (newSlip.file) formData.append("file", newSlip.file);
      await addPaymentSlip(formData);
      setShowAddModal(false);
      setNewSlip({ client: localStorage.getItem("userId"), month_paid: "", status: "current", comment: "", file: null });
      setSuccess("✅ Payment slip added successfully!");
      await loadSlips();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add payment slip.");
    } finally { setBtnLoading(false); }
  };

  const handleEditSlipSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setBtnLoading(true);
    try {
      const formData = new FormData();
      let formattedMonth = editSlip.month_paid;
      if (formattedMonth?.length === 7) formattedMonth = `${formattedMonth}-01`;
      formData.append("month_paid", formattedMonth);
      formData.append("status", editSlip.status);
      formData.append("comment", editSlip.comment);
      if (editSlip.file) formData.append("file", editSlip.file);
      await updatePaymentSlip(editSlip.slip_id, formData);
      setShowEditModal(false);
      setEditSlip({ slip_id: "", month_paid: "", status: "current", comment: "", file: null });
      setSuccess("✅ Payment slip updated successfully!");
      await loadSlips();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to update payment slip.");
    } finally { setBtnLoading(false); }
  };

  const handleViewFile = async (filePath) => {
    if (!filePath) return;
    const fileUrl = getFileUrl(filePath);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(fileUrl, { headers: { Authorization: `Token ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch file");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error opening file:", err);
      alert("Failed to open file.");
    }
  };

  const handleDeleteSlip = async (slipId) => {
    if (!window.confirm("Are you sure you want to delete this slip?")) return;
    try {
      await deletePaymentSlip(slipId);
      setSuccess("✅ Slip deleted!");
      await loadSlips();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to delete slip.");
    }
  };

  const openEditModal = (slip) => {
    setEditSlip({ slip_id: slip.slip_id, month_paid: slip.month_paid?.slice(0, 7) || "", status: slip.status, comment: slip.comment || "", file: null });
    setShowEditModal(true);
  };

  const openDetailsModal = (slip) => { setActiveSlip(slip); setShowDetailsModal(true); };

  return (
    <div className="content">
      <div className="page-header"><h2>Payment Slips</h2></div>
      {success && <div className="success-message" onClick={() => setSuccess("")}>{success}</div>}
      {error && <div className="error-message" onClick={() => setError("")}>{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Payment Slips</h3>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Payment Slip</button>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading payment slips...</div>
        ) : (
          <DataTable
            columns={["Month", "Paid For", "File", "Receipt", "Comment", "Actions"]}
            rows={slips.map((s) => ({
              Month: s.month_paid || "-",
              "Paid For": s.status === "current" ? "Current Month" : "Previous Month",
              File: <button className="btn btn-outline" onClick={() => handleViewFile(s.file)}>View Slip</button>,
              Receipt: s.receipt ? <button className="btn btn-outline" onClick={() => handleViewFile(s.receipt)}>View Receipt</button> : <i style={{ color: "#999" }}>No receipt</i>,
              Comment: <button className="btn btn-sm btn-outline" onClick={() => openDetailsModal(s)}>View Details</button>,
              Actions: <>
                <button className="btn btn-outline" onClick={() => openEditModal(s)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSlip(s.slip_id)}>Delete</button>
              </>
            }))}
          />
        )}
      </div>

      {/* Modals (Add/Edit/Details) omitted for brevity, same as before */}
    </div>
  );
};

export default PaymentSlips;
