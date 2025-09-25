import axios from "axios";

const API_BASE_URL = "/api/hotels/";

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Attach token dynamically to every request
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

// ✅ Get all hotels
export const getHotels = async (filters = {}) => {
  try {
    const response = await api.get("/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching hotels:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get a single hotel by ID
export const getHotelById = async (id) => {
  try {
    const response = await api.get(`/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching hotel with id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ Create a new hotel
export const createHotel = async (hotelData) => {
  try {
    const response = await api.post("/", hotelData);
    return response.data;
  } catch (error) {
    console.error("Error creating hotel:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update a hotel
export const updateHotel = async (id, hotelData) => {
  try {
    const response = await api.put(`/${id}/`, hotelData);
    return response.data;
  } catch (error) {
    console.error("Error updating hotel:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete a hotel
export const deleteHotel = async (id) => {
  try {
    const response = await api.delete(`/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting hotel:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Export hotels
export const exportHotels = async (format = "csv") => {
  try {
    const response = await api.get("/export/", {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting hotels:", error.response?.data || error.message);
    throw error;
  }
};
