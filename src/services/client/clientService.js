// services/client/clientService.js
import axios from "axios";

// Base API URL
const API_URL = "http://127.0.0.1:8000/api/clients/";

/**
 * Fetch all clients
 */
export const fetchClients = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Register a new client
 * @param {Object} clientData - { name, phone, email, address, password }
 */
export const registerClient = async (clientData) => {
  try {
    const response = await axios.post(API_URL, clientData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Update client data
 * @param {string} id - client ID
 * @param {Object} clientData
 */
export const updateClient = async (id, clientData) => {
  try {
    const response = await axios.put(`${API_URL}${id}/`, clientData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Delete client
 * @param {string} id - client ID
 */
export const deleteClient = async (id) => {
  try {
    await axios.delete(`${API_URL}${id}/`);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Activate or deactivate client
 * @param {string} id - client ID
 * @param {boolean} isActive
 */
export const toggleActive = async (id, isActive) => {
  try {
    const response = await axios.patch(`${API_URL}${id}/`, { is_active: isActive });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Centralized error handling
 * @param {any} error
 */
const handleError = (error) => {
  if (error.response) {
    // Backend returned an error response
    // Adjust this depending on your backend error format
    throw new Error(error.response.data?.detail || JSON.stringify(error.response.data));
  } else if (error.request) {
    // Request was made but no response
    throw new Error("Network error. Please check your connection.");
  } else {
    // Other errors
    throw new Error(error.message || "An unexpected error occurred.");
  }
};
