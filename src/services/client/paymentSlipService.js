import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://back.deploy.tz";
const API_URL = `${BACKEND_URL}/api/payment-slips/`;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach token automatically
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

// Fetch payment slips
export const fetchPaymentSlips = async () => {
  try {
    const res = await api.get("");
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.results)) return res.data.results;
    console.warn("Unexpected API response:", res.data);
    return [];
  } catch (error) {
    console.error("Error fetching payment slips:", error.response?.data || error.message);
    throw error;
  }
};

// Add payment slip
export const addPaymentSlip = async (formData) => {
  const res = await api.post("", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data;
};

// Update payment slip
export const updatePaymentSlip = async (slipId, formData) => {
  const res = await api.put(`${slipId}/`, formData, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data;
};

// Delete payment slip
export const deletePaymentSlip = async (slipId) => {
  const res = await api.delete(`${slipId}/`);
  return res.data;
};

// Helper to build full file URL
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;
  return `${BACKEND_URL}${filePath}`;
};
