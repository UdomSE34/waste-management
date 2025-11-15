import axios from "axios";

const API_URL = "https://back.deploy.tz/api/monthly-summaries/";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach auth token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers["Authorization"] = `Token ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Fetch monthly summaries aggregated per month.
 */
export const fetchMonthlySummaries = async (month = "") => {
  try {
    const url = month ? `month_summary/?month=${month}` : "month_summary/";
    const response = await api.get(url);
    return Array.isArray(response.data.summaries) ? response.data.summaries : [];
  } catch (err) {
    console.error("Error fetching monthly summaries:", err);
    return [];
  }
};

/**
 * Generate summary for a specific month.
 */
export const generateMonthlySummary = async (month) => {
  if (!month) throw new Error("Month is required (YYYY-MM)");
  try {
    const response = await api.post("generate_summaries/", { month });
    return response.data.summary || null;
  } catch (err) {
    console.error("Error generating monthly summary:", err);
    return null;
  }
};

/**
 * Update a monthly summary (processed fields)
 */
export const updateMonthlySummary = async (summaryId, data) => {
  if (!summaryId) throw new Error("summaryId is required");
  try {
    const response = await api.patch(`${summaryId}/`, data);
    return response.data;
  } catch (err) {
    console.error("Error updating monthly summary:", err);
    throw err;
  }
};

/**
 * Download Waste Report (PDF) for a specific month - OLD WORKING VERSION
 */
export const downloadWasteReport = async (month) => {
  if (!month) throw new Error("Month is required for waste report");
  try {
    // 🔥 USE OLD WORKING ENDPOINT
    const url = `https://back.deploy.tz/api/reports/waste/?month=${month}`;
    window.open(url, "_blank");
  } catch (err) {
    console.error("Failed to download waste report:", err);
    alert("Failed to download waste report.");
  }
};

/**
 * Download Payment Report (PDF) for a specific month - OLD WORKING VERSION
 */
export const downloadPaymentReport = async (month) => {
  if (!month) throw new Error("Month is required for payment report");
  try {
    // 🔥 USE OLD WORKING ENDPOINT
    const url = `https://back.deploy.tz/api/reports/payment/?month=${month}`;
    window.open(url, "_blank");
  } catch (err) {
    console.error("Failed to download payment report:", err);
    alert("Failed to download payment report.");
  }
};