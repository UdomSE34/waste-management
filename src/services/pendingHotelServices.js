import axios from "axios";

const API_BASE_URL = "/api/pending-hotels/"; // Pending hotels

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Token ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ✅ Get all pending hotels
export const getPendingHotels = async () => {
  try {
    const res = await api.get("/");
    return res.data;
  } catch (error) {
    console.error("Error fetching pending hotels:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update a pending hotel
export const updatePendingHotel = async (id, updatedData) => {
  try {
    const res = await api.put(`${id}/`, updatedData);
    return res.data;
  } catch (error) {
    console.error(`Error updating pending hotel ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete a pending hotel
export const deletePendingHotel = async (id) => {
  try {
    const res = await api.delete(`${id}/`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting pending hotel ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ Approve a pending hotel
export const approvePendingHotel = async (id) => {
  try {
    const res = await api.post(`${id}/approve/`);
    return res.data;
  } catch (error) {
    console.error(`Error approving pending hotel ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ Reject a pending hotel
export const rejectPendingHotel = async (id) => {
  try {
    const res = await api.post(`${id}/reject/`);
    return res.data;
  } catch (error) {
    console.error(`Error rejecting pending hotel ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ Export pending hotels
export const exportPendingHotels = async (format = "csv") => {
  try {
    const res = await api.get(`/export/`, {
      params: { format },
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    console.error("Error exporting pending hotels:", error.response?.data || error.message);
    throw error;
  }
};
