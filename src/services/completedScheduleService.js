import axios from "axios";

const API_URL = "/api/completed-waste-records/";

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`; // DRF expects "Token <token>"
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Get all completed schedules
export const getCompletedSchedules = async () => {
  try {
    const res = await api.get("/");
    return res.data;
  } catch (error) {
    console.error("Error fetching completed schedules:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Add completed schedule
export const addCompletedSchedule = async (data) => {
  try {
    const res = await api.post("/", data);
    return res.data;
  } catch (error) {
    console.error("Error adding completed schedule:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update completed schedule
export const updateCompletedSchedule = async (id, data) => {
  try {
    const res = await api.put(`${id}/`, data);
    return res.data;
  } catch (error) {
    console.error(`Error updating completed schedule ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete completed schedule
export const deleteCompletedSchedule = async (id) => {
  try {
    await api.delete(`${id}/`);
  } catch (error) {
    console.error(`Error deleting completed schedule ${id}:`, error.response?.data || error.message);
    throw error;
  }
};
