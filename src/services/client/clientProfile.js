import axios from 'axios';

const ADMIN_API_URL = 'https://back.deploy.tz';

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
  // ===== ADMIN ENDPOINTS =====
  
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

  // ===== CLIENT ENDPOINTS =====
  
  // Get client's own profile
  getMyProfile: async () => {
    const response = await api.get('/client/profile/');
    return response.data;
  },

  // Update client's own profile
  updateMyProfile: async (clientData) => {
    const response = await api.put('/client/profile/', clientData);
    return response.data;
  },

  // Change client's password
  changeMyPassword: async (passwordData) => {
    const response = await api.post('/client/change-password/', passwordData);
    return response.data;
  },

  // Get client dashboard data
  getMyDashboard: async () => {
    const response = await api.get('/client/dashboard/');
    return response.data;
  },

  // ===== AUTH ENDPOINTS =====
  
  // Client login
  clientLogin: async (credentials) => {
    const response = await api.post('/client/login/', credentials);
    return response.data;
  },

  // Client register
  clientRegister: async (clientData) => {
    const response = await api.post('/client/register/', clientData);
    return response.data;
  },

  // Verify client token
  verifyToken: async () => {
    const response = await api.get('/client/verify-token/');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/client/forgot-password/', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/client/reset-password/', {
      token,
      new_password: newPassword
    });
    return response.data;
  }
};

export default clientService;