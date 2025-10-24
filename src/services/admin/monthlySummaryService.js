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

export const fetchMonthlySummaries = async (month = "") => {
  const url = month ? `month_summary/?month=${month}` : "";
  const response = await api.get(url);
  return Array.isArray(response.data) ? response.data : [];
};

export const generateMonthlySummaries = async (month) => {
  if (!month) throw new Error("Month is required (YYYY-MM)");
  const response = await api.post("generate_summaries/", { month });
  return Array.isArray(response.data.summaries)
    ? response.data.summaries
    : [];
};

export const updateMonthlySummary = async (summaryId, data) => {
  const response = await api.patch(`${summaryId}/`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const addMonthlySummary = async (data) => {
  const response = await api.post("", data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};
