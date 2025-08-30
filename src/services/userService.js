import axios from "axios";

const API_URL = "/api/users/";

// Get all workers
export const fetchWorkers = async () => {
  const res = await axios.get(API_URL);
  // filter only workers
  return res.data.filter(user => user.role === "Workers");
};

// Add worker
export const addWorker = async (worker) => {
  const res = await axios.post(API_URL, worker);
  return res.data;
};

// Update worker
export const updateWorker = async (id, worker) => {
  const res = await axios.put(`${API_URL}${id}/`, worker);
  return res.data;
};

// Delete worker
export const deleteWorker = async (id) => {
  await axios.delete(`${API_URL}${id}/`);
};

// Suspend/Activate worker
export const toggleActive = async (id, isActive) => {
  const res = await axios.patch(`${API_URL}${id}/`, { is_active: isActive });
  return res.data;
};
