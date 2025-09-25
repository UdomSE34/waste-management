import axios from "axios";

const API_URL = "/api/users/";

// Create an Axios instance with token interceptor
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`; // DRF expects "Token <token>"
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Utility to validate ID
const validateId = (id, context) => {
  if (!id && id !== 0) {
    throw new Error(`${context}: User ID is required but received ${typeof id}: ${id}`);
  }
  if (typeof id === "string" && !id.trim()) {
    throw new Error(`${context}: User ID cannot be an empty string`);
  }
  return true;
};

// ✅ Get all workers
export const fetchWorkers = async () => {
  try {
    const res = await api.get("/");

    let users = [];
    if (Array.isArray(res.data)) {
      users = res.data;
    } else if (res.data && Array.isArray(res.data.results)) {
      users = res.data.results; // Handle pagination
    } else {
      console.warn("Unexpected API response format:", res.data);
      return [];
    }

    return users.filter(
      (user) =>
        ["Workers", "Supervisors", "Drivers", "HR"].includes(user.role)
    );
  } catch (error) {
    console.error("❌ Error fetching workers:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// ✅ Add worker
export const addWorker = async (worker) => {
  if (!worker || typeof worker !== "object") {
    throw new Error("Invalid worker data: expected an object");
  }

  try {
    const res = await api.post("/", worker);
    return res.data;
  } catch (error) {
    console.error("❌ Error adding worker:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// ✅ Request suspend with comment
export const requestSuspend = async (userId, comment) => {
  validateId(userId, "requestSuspend");

  try {
    const payload = {
      action: "suspend",
      comment: comment?.trim() || "",
    };
    const url = `${userId}/submit_comment/`.replace(/\/+/g, "/");
    const res = await api.patch(url, payload);

    return res.data;
  } catch (error) {
    console.error("❌ Error requesting suspend:", {
      userId,
      comment,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// ✅ Request delete with comment
export const requestDelete = async (userId, comment) => {
  validateId(userId, "requestDelete");

  try {
    const payload = {
      action: "delete",
      comment: comment?.trim() || "",
    };
    const url = `${userId}/submit_comment/`.replace(/\/+/g, "/");
    const res = await api.patch(url, payload);

    return res.data;
  } catch (error) {
    console.error("❌ Error requesting delete:", {
      userId,
      comment,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};
