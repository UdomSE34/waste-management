// src/api/api.jsx
import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach token dynamically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Token ${token}`; // use Bearer if JWT
  }
  return config;
});

// Login
export async function loginUser(email, password) {
  const res = await api.post("/login/", { email, password });
  const { token, user } = res.data; // expect API returns { token, user }

  // Save token and essential user info
  localStorage.setItem("authToken", token);
  localStorage.setItem("userRole", user.role);
  localStorage.setItem("userName", user.name);
  localStorage.setItem("userId", user.id);
  localStorage.setItem("userEmail", user.email);

  return { token, user };
}

// Logout helper
export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  window.location.href = "/login";
}

export default api;
