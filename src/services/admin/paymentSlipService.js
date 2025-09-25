
import axios from "axios";

const API_URL = "/api/payment-slips/";

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

// Fetch payment slips (optional month filter)
export const fetchPaymentSlips = async (month = "") => {
  try {
    let url = "";
    if (month) {
      url = `?month=${month}`; // backend should filter by month if query param is provided
    }
    const res = await api.get(url);
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  } catch (error) {
    console.error("❌ Error fetching payment slips:", error);
    throw error;
  }
};
