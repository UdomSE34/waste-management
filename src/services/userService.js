import axios from "axios";

// Ensure API_URL ends with a slash for consistent URL building
const API_URL = "/api/users/";

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

// Get all workers
export const fetchWorkers = async () => {
  try {
    const res = await axios.get(API_URL);

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
        user.role === "Workers" ||
        user.role === "Supervisors" ||
        user.role === "Drivers" ||
        user.role === "HR"
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

// Add worker
export const addWorker = async (worker) => {
  if (!worker || typeof worker !== "object") {
    throw new Error("Invalid worker data: expected an object");
  }

  try {
    const res = await axios.post(API_URL, worker);
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

// Request suspend with comment
export const requestSuspend = async (userId, comment) => {
  validateId(userId, "requestSuspend");

  try {
    const payload = {
      action: "suspend",
      comment: comment?.trim() || "", // Ensure comment is a string
    };

    // Ensure no double slashes
    const url = `${API_URL}${userId}/submit_comment/`.replace(/\/+/g, "/");
    const res = await axios.patch(url, payload);

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

// Request delete with comment
export const requestDelete = async (userId, comment) => {
  validateId(userId, "requestDelete");

  try {
    const payload = {
      action: "delete",
      comment: comment?.trim() || "",
    };

    const url = `${API_URL}${userId}/submit_comment/`.replace(/\/+/g, "/");
    const res = await axios.patch(url, payload);

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