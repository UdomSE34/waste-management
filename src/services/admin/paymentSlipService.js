import axios from "axios";

// Create Axios instance
export const api = axios.create({
  baseURL: "/api", // Django API base URL
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
  const params = month ? { month } : {};
  const res = await api.get("/payment-slips/", { params });
  return Array.isArray(res.data) ? res.data : res.data.results || [];
};

// ✅ Unified update function: amount, receipt, and admin comment
export const updatePaymentSlip = async (slipId, { amount, receiptFile, adminComment }) => {
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
};
