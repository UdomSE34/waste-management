import axios from 'axios';

const API_BASE_URL = '/api/schedules'; // Base URL

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to every request dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Make sure the header matches DRF expectation: "Token <token>"
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: intercept responses to catch 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Token may be invalid or expired.");
      // Optional: redirect to login page
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getCollections = async (params = {}) => {
  const response = await api.get('/', { params });
  return response.data;
};

export const createCollection = async (collectionData) => {
  const response = await api.post('/', collectionData);
  return response.data;
};

export const updateCollection = async (schedule_id, updateData) => {
  const response = await api.patch(`/${schedule_id}/`, updateData);
  return response.data;
};

export const deleteCollection = async (schedule_id) => {
  const response = await api.delete(`/${schedule_id}/`);
  return response.data;
};
