import axios from "axios";

const API_URL = "/api/users/";

// --- Constants ---
const ALLOWED_ROLES = ["Staff", "Workers", "Supervisors", "Drivers", "HR"];
const ALLOWED_ACTIONS = ["approve", "reject"];
const ALLOWED_TYPES = ["suspend", "delete", "activate"];

// --- Utilities ---
const validateId = (id, context) => {
  if (!id) throw new Error(`${context}: Invalid user ID: ${id}`);
  return true;
};

const cleanUrl = (url) => url.replace(/\/+/g, "/").replace(":/", "://");

// --- Get all workers ---
export const getWorkers = async () => {
  try {
    const res = await axios.get(API_URL);
    const users = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
    return users.filter((user) => ALLOWED_ROLES.includes(user.role));
  } catch (error) {
    console.error("❌ Failed to fetch workers:", error);
    throw error;
  }
};

// --- Delete worker (soft delete with comment) ---
export const deleteWorker = async (id, comment) => {
  validateId(id, "deleteWorker");
  if (!comment?.trim()) throw new Error("A reason/comment is required for deletion");

  try {
    const url = cleanUrl(`${API_URL}${id}/`);
    const res = await axios.patch(url, {
      status: "deleted",
      finaldelete_comment: comment,
      deleted_at: new Date().toISOString(),
    });
    return res.data;
  } catch (error) {
    console.error("❌ Failed to delete worker:", error);
    throw error;
  }
};

// --- Unified approve/reject action ---
export const approveAction = async (id, action, type, comment) => {
  validateId(id, "approveAction");

  if (!ALLOWED_ACTIONS.includes(action))
    throw new Error(`Action must be one of: ${ALLOWED_ACTIONS.join(", ")}`);
  if (!ALLOWED_TYPES.includes(type))
    throw new Error(`Type must be one of: ${ALLOWED_TYPES.join(", ")}`);
  if (!comment?.trim())
    throw new Error("A reason/comment is required for this action");

  try {
    const url = cleanUrl(`${API_URL}${id}/approve-action/`);
    const res = await axios.patch(url, { action, type, comment });
    return res.data;
  } catch (error) {
    console.error("❌ Failed to approve/reject action:", error);
    throw error;
  }
};
