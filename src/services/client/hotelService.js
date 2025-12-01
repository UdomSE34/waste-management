import axios from "axios";

// Base API client
const api = axios.create({
  baseURL: "https://back.deploy.tz/api",  
  timeout: 10000,
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const hotelService = {
  // Get unclaimed hotels
  getUnclaimedHotels: async (search = "") => {
    const response = await api.get("/hotels/unclaimed_hotels/", {
      params: { search },
    });
    return response.data;
  },

  // Claim hotels (fixed URL)
  claimHotels: async (clientId, hotelIds) => {
    try {
      const response = await api.patch("/hotels/claim_hotels/", { // <- dash instead of underscore
        client_id: clientId,
        hotel_ids: hotelIds,
      });
      return response.data;
    } catch (error) {
      console.error("Error claiming hotels:", error.response?.data || error.message);
      throw error;
    }
  },

  // Create pending hotel
  createPendingHotel: async (hotelData) => {
    const response = await api.post("/pending-hotels/", hotelData);
    return response.data;
  },

  // Fetch hotels
  fetchHotels: async (filters = {}) => {
    const response = await api.get("/hotels/", { params: filters });
    return response.data;
  },

  // Get my hotels
  getMyHotels: async () => {
    const response = await api.get("/hotels/my_hotels/");
    return response.data;
  },
};

export default hotelService;
