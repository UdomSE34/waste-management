// src/services/vehicleService.js
import axios from 'axios';

const API_BASE_URL = '/api/vehicles/';

export const getVehicles = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};