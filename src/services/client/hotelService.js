import axios from "axios";

// Base API client pointing to /api/
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
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

const hotelService = {
  // POST new pending hotel
  createPendingHotel: async (hotelData) => {
    try {
      const response = await api.post("/pending-hotels/", hotelData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // GET all pending hotels
  getPendingHotels: async () => {
    try {
      const response = await api.get("/pending-hotels/");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Centralized error handling
const handleError = (error) => {
  if (error.response) {
    throw new Error(error.response.data?.detail || JSON.stringify(error.response.data));
  } else if (error.request) {
    throw new Error("Network error. Please check your connection.");
  } else {
    throw new Error(error.message || "An unexpected error occurred.");
  }
};

export default hotelService;
