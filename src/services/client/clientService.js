import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/clients/";

// Create an Axios instance with token attached automatically
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Service functions
export const fetchClients = async () => {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const registerClient = async (clientData) => {
  try {
    const response = await api.post("/", clientData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateClient = async (id, clientData) => {
  try {
    const response = await api.put(`${id}/`, clientData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteClient = async (id) => {
  try {
    await api.delete(`${id}/`);
  } catch (error) {
    handleError(error);
  }
};

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
    throw new Error(error.response.data?.detail || JSON.stringify(error.response.data));
  } else if (error.request) {
    throw new Error("Network error. Please check your connection.");
  } else {
    throw new Error(error.message || "An unexpected error occurred.");
  }
};
