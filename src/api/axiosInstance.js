import axios from "axios";

const api = axios.create({
  // baseURL: "http://127.0.0.1:8000",
  baseURL: "https://back.deploy.tz/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
