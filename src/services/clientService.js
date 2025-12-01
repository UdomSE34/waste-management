import axios from 'axios';

const ADMIN_API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: ADMIN_API_URL,
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

const clientService = {
  // Get all clients (admin only)
  getAllClients: async () => {
    const response = await api.get('/clients-management/list-all/');
    return response.data;
  },

  // Create new client (admin only)
  createClient: async (clientData) => {
    const response = await api.post('/clients-management/', clientData);
    return response.data;
  },

  // Update client (admin only)
  updateClient: async (clientId, clientData) => {
    const response = await api.put(`/clients-management/${clientId}/`, clientData);
    return response.data;
  },

  // Delete client (admin only)
  deleteClient: async (clientId) => {
    const response = await api.delete(`/clients-management/${clientId}/`);
    return response.data;
  },

  // Get single client (admin only)
  getClient: async (clientId) => {
    const response = await api.get(`/clients-management/${clientId}/`);
    return response.data;
  },
};

export default clientService;