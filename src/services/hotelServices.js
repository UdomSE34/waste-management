// src/services/hotelService.js
import axios from "axios";

const API_BASE_URL = "/api/hotels/";  // Note the leading slash
// 👆 replace with your backend hotels endpoint

// ✅ Get all hotels (optionally filter by location, rating, etc.)
export const getHotels = async (filters = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching hotels:", error);
    throw error;
  }
};

// ✅ Get a single hotel by ID
export const getHotelById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching hotel with id ${id}:`, error);
    throw error;
  }
};

// ✅ Create a new hotel
export const createHotel = async (hotelData) => {
  try {
    const response = await axios.post(API_BASE_URL, hotelData);
    return response.data;
  } catch (error) {
    console.error("Error creating hotel:", error);
    throw error;
  }
};

// ✅ Update a hotel
export const updateHotel = async (id, hotelData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/`, hotelData);
    return response.data;
  } catch (error) {
    console.error("Error updating hotel:", error);
    throw error;
  }
};

// ✅ Delete a hotel
export const deleteHotel = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting hotel:", error);
    throw error;
  }
};

// ✅ Export hotels (CSV/Excel/PDF depending on backend support)
export const exportHotels = async (format = "csv") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/export`, {
      params: { format },
      responseType: "blob", // 👈 so browser treats it as a file
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting hotels:", error);
    throw error;
  }
};
