import axios from "axios";

const API_BASE_URL = "/api/schedules"; // base URL

// Create Axios instance with token interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Token ${token}`; // DRF expects "Token <token>"
  }
  return config;
}, (error) => Promise.reject(error));

// ✅ Get all collections
export const getCollections = async (params = {}) => {
  try {
    const response = await api.get("/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching collections:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Create a new collection
export const createCollection = async (collectionData) => {
  try {
    const response = await api.post("/", collectionData);
    return response.data;
  } catch (error) {
    console.error("Error creating collection:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update a collection
export const updateCollection = async (schedule_id, updateData) => {
  try {
    const response = await api.patch(`/${schedule_id}/`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating collection:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete a collection
export const deleteCollection = async (schedule_id) => {
  try {
    const response = await api.delete(`/${schedule_id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting collection:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update visibility for all schedules of a hotel by name
export const updateScheduleVisibility = async (hotelName, isVisible) => {
  try {
    const response = await api.patch("update_visibility_by_hotel/", {
      hotel_name: hotelName,
      is_visible: isVisible,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating schedule visibility:", error.response?.data || error.message);
    throw error;
  }
};
