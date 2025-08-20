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

// ✅ Create a new collection
export const createCollection = async (collectionData) => {
  try {
    const response = await api.post('/', collectionData);
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
