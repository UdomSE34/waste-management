// src/services/collectionService.js
import axios from 'axios';

const API_BASE_URL = '/api/schedules'; // Removed trailing slash to avoid double //

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ✅ Get all collections
export const getCollections = async (params = {}) => {
  try {
    const response = await api.get('/', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching collections:", error.response?.data || error.message);
    throw error;
  }
};

