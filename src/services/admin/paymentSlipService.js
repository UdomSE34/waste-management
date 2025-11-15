import axios from "axios";

// Create Axios instance
export const api = axios.create({
  baseURL: "https://back.deploy.tz/api", // 🔥 FULL URL
  timeout: 10000,
});

// Automatically attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- API METHODS ----------------

// Fetch all payment slips (optionally filtered by month)
export const fetchPaymentSlips = async (month = "") => {
  try {
    const params = month ? { month } : {};
    const res = await api.get("/payment-slips/", { params });
    
    let slips = Array.isArray(res.data) ? res.data : res.data.results || [];
    
    // 🔥 REMOVED: No URL conversion needed - use original file paths
    return slips;
  } catch (error) {
    console.error("❌ Error fetching payment slips:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// ✅ Unified update function: amount, receipt, and admin comment
export const updatePaymentSlip = async (slipId, { amount, receiptFile, adminComment }) => {
  try {
    const formData = new FormData();

    if (amount !== undefined) formData.append("amount", amount);
    if (receiptFile) formData.append("receipt", receiptFile);
    if (adminComment !== undefined) formData.append("admin_comment", adminComment);

    const { data } = await api.patch(`/payment-slips/${slipId}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error) {
    console.error("❌ Error updating payment slip:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};