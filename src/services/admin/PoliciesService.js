import axios from "axios";

const API_URL = "/api/salary/role-salary-policies/";

// Token-aware Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Fetch all salary policies
export const fetchRolePolicies = async () => {
  try {
    const res = await api.get("/");
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch role policies:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Create a new role salary policy
export const createRolePolicy = async (policy) => {
  try {
    const res = await api.post("/", policy);
    return res.data;
  } catch (error) {
    console.error("Failed to create role policy:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update an existing role salary policy (by role)
export const updateRolePolicy = async (role, policy) => {
  try {
    const res = await api.put(`${role}/`, policy);
    return res.data;
  } catch (error) {
    console.error("Failed to update role policy:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete a role salary policy
export const deleteRolePolicy = async (role) => {
  try {
    await api.delete(`${role}/`);
  } catch (error) {
    console.error("Failed to delete role policy:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Default export
const rolePolicyService = {
  fetchRolePolicies,
  createRolePolicy,
  updateRolePolicy,
  deleteRolePolicy,
};

export default rolePolicyService;
