// src/services/hotelService.js
import axios from "axios";

// Base API client pointing to /api/
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Service for Pending Hotels (client submission)
const hotelService = {
  // POST new pending hotel
  createPendingHotel: async (hotelData) => {
    return await api.post("/pending-hotels/", hotelData);
  },

  // GET all pending hotels (optional: if client wants to see their submissions)
  getPendingHotels: async () => {
    return await api.get("/pending-hotels/");
  },
};

export default hotelService;
