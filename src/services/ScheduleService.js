// services/ScheduleService.js
import axios from "axios";

const API_BASE_URL = "/api/schedules/";

const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers["Authorization"] = `Token ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Collections
export const getCollections = async () => {
  try {
    const response = await api.get("");
    return response.data;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

export const updateCollection = async (schedule_id, updateData) =>
  (await api.patch(`${schedule_id}/`, updateData)).data;

// Visibility by hotel ID
export const updateScheduleVisibility = async (hotelId, isVisible) =>
  (await api.patch("update_visibility_by_hotel/", { hotel_id: hotelId, is_visible: isVisible })).data;

// Apology messages by hotel ID
export const sendTodayMessage = async (hotelId = null) =>
  (await api.post("send_today_message/", hotelId ? { hotel_id: hotelId } : {})).data;

export const sendTomorrowMessage = async (hotelId = null) =>
  (await api.post("send_tomorrow_message/", hotelId ? { hotel_id: hotelId } : {})).data;

// Download filtered PDF
export const downloadFilteredPDF = async (addresses = []) => {
  try {
    const res = await api.post("/download_filtered_pdf/", {
      addresses: addresses
    }, {
      responseType: 'blob'
    });
    return res.data;
  } catch (error) {
    console.error("Failed to download filtered PDF:", error);
    throw error;
  }
};

// ✅ AUTO-GENERATION Functions
export const checkAndInitialize = async () => {
  try {
    const status = await api.get("system_status/");
    
    if (!status.data.current_week?.has_schedules) {
      const initResponse = await api.post("initialize_system/");
      return { auto_initialized: true, data: initResponse.data };
    }
    
    return { auto_initialized: false, data: status.data };
  } catch (error) {
    console.warn('Auto-initialization check failed:', error);
    return { auto_initialized: false, error: error.message };
  }
};

export const getSystemStatus = async () => {
  try {
    const response = await api.get("system_status/");
    return response.data;
  } catch (error) {
    console.error('Error getting system status:', error);
    throw error;
  }
};

export const initializeSystem = async () => {
  try {
    const response = await api.post("initialize_system/");
    return response.data;
  } catch (error) {
    console.error('Error initializing system:', error);
    throw error;
  }
};