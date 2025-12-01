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
export const fetchHotels = async (filters = {}) => {
  try {
    const response = await api.get("/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching hotels:", error.response?.data || error.message);
    throw error;
  }
};
