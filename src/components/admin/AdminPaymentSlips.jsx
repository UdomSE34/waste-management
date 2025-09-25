import { useEffect, useState } from "react";
import DataTable from "../admin/DataTable";
import { fetchPaymentSlips } from "../../services/admin/paymentSlipService"; 
import { fetchHotels } from "../../services/admin/hotelService"; 

const AdminPaymentSlips = () => {
  const [slips, setSlips] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // month filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clearMessages = () => setError("");

  useEffect(() => {
    loadHotels();
    loadSlips();
  }, []);

  // Fetch all hotels
  const loadHotels = async () => {
    try {
      const data = await fetchHotels();
      setHotels(data);
    } catch (err) {
      console.error("❌ Failed to load hotels:", err);
      setError("Failed to load hotels.");
    }
  };

  // Fetch slips and filter by month
  const loadSlips = async (month = "") => {
    clearMessages();
    setLoading(true);
    try {
      const data = await fetchPaymentSlips(month); 
      let filtered = Array.isArray(data) ? data : [];

      // Filter by selected month if month is provided
      if (month) {
        filtered = filtered.filter((slip) => slip.month_paid?.startsWith(month));
      }

      setSlips(filtered);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load payment slips.");
    } finally {
      setLoading(false);
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    loadSlips(month);
  };

  // View PDF/Image slip
  const handleViewSlip = (fileUrl) => {
    if (!fileUrl) return;
    const token = localStorage.getItem("authToken");

    fetch(fileUrl, { headers: { Authorization: `Token ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      })
      .catch((err) => {
        console.error("❌ Error opening slip:", err);
        setError("");
      });
  };

  return (
    <div className="content">
      <div className="page-header">
        <h2>All Hotel Payment Slips</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Payment Slips</h3>
          <div style={{ marginTop: "0.5rem" }}>
            <label>Filter by Month: </label>
            <input type="month" value={selectedMonth} onChange={handleMonthChange} />
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading payment slips...</div>
        ) : (
          <DataTable
            columns={["Hotel Name", "Month", "Comment", "Payment Month", "File"]}
            rows={slips.map((s) => {
              // Find hotel by matching client_id
              const hotel = hotels.find((h) => h.client === s.client);
              return {
                "Hotel Name": hotel?.name || "-",
                Month: s.month_paid
                  ? new Date(s.month_paid).toLocaleString("en-US", { month: "long", year: "numeric" })
                  : "-",
                Comment: s.comment || "-",
                "Payment Month": s.status || "- ",
                File: (
                  <button className="btn btn-sm" onClick={() => handleViewSlip(s.file)}>
                    View
                  </button>
                ),

              };
            })}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPaymentSlips;
