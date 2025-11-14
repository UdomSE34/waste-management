import axios from "axios";

// Token-aware Axios instance
const api = axios.create({
  baseURL: "/api/users/",
  timeout: 10000,
});

// Attach token to every request
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

/**
 * Get all workers (filter by roles)
 */
export const getWorkers = async () => {
  try {
    const res = await api.get("/");
    return Array.isArray(res.data)
      ? res.data.filter((user) =>
          ["Workers", "Supervisors", "Drivers", "HR", "Staff", "Council"].includes(user.role)
        )
      : [];
  } catch (error) {
    console.error("Error fetching workers:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Add a new worker
 * @param {Object} worker - worker object { name, email, role, etc. }
 */
export const addWorker = async (worker) => {
  if (!worker || typeof worker !== "object") {
    throw new Error("Invalid worker data: expected an object");
  }

  try {
    const res = await api.post("/", worker);
    return res.data;
  } catch (error) {
    console.error("Error adding worker:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Unified action for suspend, activate, delete, approve, reject
 * @param {string} userId - User UUID
 * @param {string} action - 'approve' | 'reject'
 * @param {string} type - 'suspend' | 'delete' | 'activate'
 * @param {string} comment - Reason/comment (required)
 */
export const approveAction = async (userId, action, type, comment) => {
  if (!userId || !action || !type || !comment) {
    throw new Error("userId, action, type, and comment are all required");
  }

  try {
    const res = await api.patch(`${userId}/approve-action/`, { action, type, comment });
    return res.data;
  } catch (error) {
    console.error("Error performing approve action:", error.response?.data || error.message);
    throw error;
  }
};
