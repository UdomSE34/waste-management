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
export const getCollections = async () => (await api.get("")).data;
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
