import axios from "axios";

const API_URL = "/api/completed-waste-records/";

// Get all completed schedules
export const getCompletedSchedules = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Add completed schedule
export const addCompletedSchedule = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

// Update completed schedule
export const updateCompletedSchedule = async (id, data) => {
  const res = await axios.put(`${API_URL}${id}/`, data); // Note the trailing slash if your backend uses DRF
  return res.data;
};

// Delete completed schedule
export const deleteCompletedSchedule = async (id) => {
  await axios.delete(`${API_URL}${id}/`);
};
