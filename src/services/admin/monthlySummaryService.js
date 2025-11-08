import axios from "axios";

const API_URL = "/api/monthly-summaries/";

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
 * @param {string} month - Optional month in YYYY-MM format. If omitted, fetch all months.
 * @returns {Array} summaries
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
 * @param {string} month - Month in YYYY-MM format
 * @returns {Object|null} summary
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
 * @param {string} summaryId - ID of the monthly summary
 * @param {Object} data - { total_processed_waste, total_processed_payment }
 * @returns {Object} updated summary
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
 * Add a manual monthly summary (optional)
 * @param {Object} data - { month: "YYYY-MM-DD", total_actual_waste, total_processed_waste, total_actual_payment, total_processed_payment }
 * @returns {Object} added summary
 */
export const addMonthlySummary = async (data) => {
  try {
    const response = await api.post("", data);
    return response.data;
  } catch (err) {
    console.error("Error adding monthly summary:", err);
    throw err;
  }
};

/**
 * Download Waste Report (PDF) for a specific month
 * @param {string} month - Month in YYYY-MM format
 */
export const downloadWasteReport = async (month) => {
  if (!month) throw new Error("Month is required for waste report");
  try {
    const url = `/api/reports/waste/?month=${month}`;
    window.open(url, "_blank");
  } catch (err) {
    console.error("Failed to download waste report:", err);
    alert("Failed to download waste report. See console for details.");
  }
};

/**
 * Download Payment Report (PDF) for a specific month
 * @param {string} month - Month in YYYY-MM format
 */
export const downloadPaymentReport = async (month) => {
  if (!month) throw new Error("Month is required for payment report");
  try {
    const url = `/api/reports/payment/?month=${month}`;
    window.open(url, "_blank");
  } catch (err) {
    console.error("Failed to download payment report:", err);
    alert("Failed to download payment report. See console for details.");
  }
};
