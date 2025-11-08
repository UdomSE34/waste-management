import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/schedules"; // full backend URL
// const API_BASE_URL = "https://back.deploy.tz/api/schedules"; // full backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 👉 Fetch schedules and check if at least one is visible
export const getScheduleVisibility = async () => {
  try {
    const res = await api.get("/"); // GET /api/schedules/
    return Array.isArray(res.data) && res.data.some((schedule) => schedule.is_visible === true);
  } catch (err) {
    console.error("Error fetching schedule visibility:", err.response?.data || err.message);
    throw err;
  }
};
