// src/services/admin/PaidHotelService.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/paid-hotels/";

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach token automatically
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

// ✅ Fetch all PaidHotelInfo records
export const getPaidHotels = async () => {
  const res = await api.get("/");
  return res.data;
};

// ✅ Mark a hotel as Paid
export const markHotelAsPaid = async (id) => {
  const res = await api.patch(`${id}/mark_paid/`);
  return res.data;
};

// ✅ Mark a hotel as Unpaid
export const markHotelAsUnpaid = async (id) => {
  const res = await api.patch(`${id}/mark_unpaid/`);
  return res.data;
};

// ✅ Export PaidHotelInfo data
export const exportPaidHotels = async (format = "pdf") => {
  const response = await api.get(`export_${format}/`, {
    responseType: "blob",
  });
  return response;
};

// ✅ Delete a PaidHotelInfo record
export const deletePaidHotel = async (id) => {
  const res = await api.delete(`${id}/`);
  return res.data;
};
