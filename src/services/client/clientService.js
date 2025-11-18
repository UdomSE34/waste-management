import axios from "axios";

// Base API URL
// const API_URL = "http://127.0.0.1:8000/api/clients/";
const API_URL = "https://back.deploy.tz/api/clients/";

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach token from localStorage to every request automatically
api.interceptors.request.use(
  (config) => {
    // Do not attach token for registration endpoint
    if (!config.url.includes("register/")) {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers["Authorization"] = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch all clients (requires authentication)
export const fetchClients = async () => {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Register client (no token required)
export const registerClient = async (clientData) => {
  try {
    const response = await api.post("register/", clientData);

    // Save token in localStorage for future authenticated requests
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
    }

    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Update client info (requires authentication)
export const updateClient = async (id, clientData) => {
  try {
    const response = await api.put(`${id}/`, clientData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Delete client (requires authentication)
export const deleteClient = async (id) => {
  try {
    await api.delete(`${id}/`);
  } catch (error) {
    handleError(error);
  }
};

// Toggle active/inactive status (requires authentication)
export const toggleActive = async (id, isActive) => {
  try {
    const response = await api.patch(`${id}/`, { is_active: isActive });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Centralized error handler
const handleError = (error) => {
  if (error.response) {
    // DRF usually returns { detail: "..." }
    throw new Error(
      error.response.data?.detail || JSON.stringify(error.response.data)
    );
  } else if (error.request) {
    throw new Error("Network error. Please check your connection.");
  } else {
    throw new Error(error.message || "An unexpected error occurred.");
  }
};

// Logout function (removes token from localStorage)
export const logoutClient = () => {
  localStorage.removeItem("authToken");
};
