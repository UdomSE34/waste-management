import axios from "axios";

const API_URL = "/api/users/";

// Utility: Validate ID
const validateId = (id, context) => {
  if (id === undefined || id === null || id === "") {
    throw new Error(`${context}: Invalid user ID: ${id}`);
  }
  return true;
};

// Utility: Clean URL (prevent double slashes)
const cleanUrl = (url) => url.replace(/\/+/g, "/").replace(":/", "://");

// Get all workers
export const getWorkers = async () => {
  try {
    const res = await axios.get(API_URL);

    let users = [];
    if (Array.isArray(res.data)) {
      users = res.data;
    } else if (res.data && Array.isArray(res.data.results)) {
      users = res.data.results; // Handle pagination
    } else {
      console.warn("Unexpected response format from /api/users/", res.data);
      return [];
    }

    // Filter roles: adjust these to match your backend's exact role strings
    return users.filter(
      (user) =>
        user.role === "Staff" ||
        user.role === "Workers" ||
        user.role === "Supervisors" ||
        user.role === "Drivers" ||
        user.role === "HR"
    );
  } catch (error) {
    console.error("❌ Failed to fetch workers:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Add worker
export const createWorker = async (worker) => {
  if (!worker || typeof worker !== "object") {
    throw new Error("Invalid worker data: expected an object");
  }

  try {
    const res = await axios.post(API_URL, worker);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to create worker:", {
      payload: worker,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Update worker
export const updateWorker = async (id, worker) => {
  validateId(id, "updateWorker");

  if (!worker || typeof worker !== "object") {
    throw new Error("Invalid worker data to update");
  }

  try {
    const url = cleanUrl(`${API_URL}${id}/`);
    const res = await axios.put(url, worker);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to update worker:", {
      id,
      payload: worker,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Delete worker (hard delete)
export const deleteWorker = async (id) => {
  validateId(id, "deleteWorker");

  try {
    const url = cleanUrl(`${API_URL}${id}/`);
    await axios.delete(url);
  } catch (error) {
    console.error("❌ Failed to delete worker:", {
      id,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Suspend/Activate worker (via status or is_active)
// In workerService.js
export const toggleActive = async (id, isActive) => {
  validateId(id, "toggleActive");
  const newStatus = isActive ? "active" : "suspended";

  try {
    const url = cleanUrl(`${API_URL}${id}/`);
    const res = await axios.patch(url, { status: newStatus });
    return res.data;
  } catch (error) {
    console.error("❌ Failed to update status:", { id, newStatus, error });
    throw error;
  }
};

// Approve or reject suspend/delete request
export const approveAction = async (id, action, type) => {
  validateId(id, "approveAction");

  if (!["approve", "reject"].includes(action)) {
    throw new Error("Action must be 'approve' or 'reject'");
  }
  if (!["suspend", "delete"].includes(type)) {
    throw new Error("Type must be 'suspend' or 'delete'");
  }

  try {
    const url = cleanUrl(`${API_URL}${id}/approve-action/`);
    const res = await axios.post(url, { action, type });
    return res.data;
  } catch (error) {
    console.error("❌ Failed to approve/reject action:", {
      id,
      action,
      type,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};