import axios from "axios";

const API_URL = "https://back.deploy.tz/api/monthly-summaries/"; // 🔥 FULL URL

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
 * Fetch monthly summaries
 * @param {string} month - Optional month in YYYY-MM format
 * @returns {Array} summaries
 */
export const fetchMonthlySummaries = async (month = "") => {
  try {
    let url = "";
    if (month) {
      // 🔥 FIXED: Use new endpoint name
      url = `by-month/?month=${month}`;
    } else {
      url = ""; // Get all summaries
    }
    const response = await api.get(url);
    
    // 🔥 FIXED: Handle different response formats
    if (month && response.data.summary) {
      return [response.data.summary]; // Single summary for specific month
    } else if (response.data.summaries) {
      return response.data.summaries; // Multiple summaries
    } else if (Array.isArray(response.data)) {
      return response.data; // Direct array
    } else {
      return [];
    }
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
    // 🔥 FIXED: Use new endpoint name
    const response = await api.post("generate-summary/", { month });
    return response.data.summary || null;
  } catch (err) {
    console.error("Error generating monthly summary:", err);
    throw err;
  }
};

/**
 * Update a monthly summary (processed fields and files)
 * @param {string} summaryId - ID of the monthly summary
 * @param {Object} data - Update data
 * @param {boolean} isFormData - Whether data is FormData for file upload
 * @returns {Object} updated summary
 */
export const updateMonthlySummary = async (summaryId, data, isFormData = false) => {
  if (!summaryId) throw new Error("summaryId is required");
  try {
    const config = isFormData ? {
      headers: { "Content-Type": "multipart/form-data" }
    } : {};
    
    const response = await api.patch(`${summaryId}/`, data, config);
    return response.data;
  } catch (err) {
    console.error("Error updating monthly summary:", err);
    throw err;
  }
};

/**
 * Download reports using new endpoints
 */
export const downloadWasteReport = async (month) => {
  if (!month) throw new Error("Month is required for waste report");
  try {
    // 🔥 FIXED: Use new endpoint
    const url = `${API_URL}generate-waste-pdf/?month=${month}`;
    window.open(url, "_blank");
  } catch (err) {
    console.error("Failed to download waste report:", err);
    alert("Failed to download waste report.");
  }
};

export const downloadPaymentReport = async (month) => {
  if (!month) throw new Error("Month is required for payment report");
  try {
    // 🔥 FIXED: Use new endpoint
    const url = `${API_URL}generate-payment-pdf/?month=${month}`;
    window.open(url, "_blank");
  } catch (err) {
    console.error("Failed to download payment report:", err);
    alert("Failed to download payment report.");
  }
};

// 🔥 NEW: Download uploaded reports
export const downloadUploadedWasteReport = async (summaryId) => {
  if (!summaryId) throw new Error("summaryId is required");
  try {
    const url = `${API_URL}${summaryId}/download-waste-report/`;
    window.open(url, "_blank");
  } catch (err) {
    console.error("Failed to download uploaded waste report:", err);
    alert("Failed to download waste report.");
  }
};

export const downloadUploadedPaymentReport = async (summaryId) => {
  if (!summaryId) throw new Error("summaryId is required");
  try {
    const url = `${API_URL}${summaryId}/download-payment-report/`;
    window.open(url, "_blank");
  } catch (err) {
    console.error("Failed to download uploaded payment report:", err);
    alert("Failed to download payment report.");
  }
};