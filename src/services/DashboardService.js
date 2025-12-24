// services/schedulesService.js
import axios from 'axios';

const API_BASE_URL = 'https://back.deploy.tz/api/schedules';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to every request
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

// Handle API responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Token may be invalid or expired.");
    }
    return Promise.reject(error);
  }
);

// ✅ CRUD Operations
export const getSchedules = async (params = {}) => {
  try {
    const response = await api.get('/', { params });
    
    // Handle different response formats
    if (response.data && Array.isArray(response.data)) {
      return response.data; // Direct array
    } else if (response.data && response.data.results) {
      return response.data.results; // Paginated response
    } else if (response.data && response.data.schedules) {
      return response.data.schedules; // Nested schedules
    } else if (response.data && response.data.data) {
      return response.data.data; // Nested data
    } else {
      console.warn('Unexpected API response format:', response.data);
      return []; // Return empty array
    }
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

export const createSchedule = async (scheduleData) => {
  try {
    const response = await api.post('/', scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

export const updateSchedule = async (schedule_id, updateData) => {
  try {
    const response = await api.patch(`/${schedule_id}/`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

export const deleteSchedule = async (schedule_id) => {
  try {
    const response = await api.delete(`/${schedule_id}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};

// ✅ AUTO-GENERATION Endpoints
export const getWeeklyOverview = async () => {
  try {
    const response = await api.get('/weekly-overview/');
    return response.data;
  } catch (error) {
    console.error('Error getting weekly overview:', error);
    throw error;
  }
};

export const getSchedulesByWeekType = async (weekType = 'current') => {
  try {
    const response = await api.get(`/by-week-type/?type=${weekType}`);
    return response.data;
  } catch (error) {
    console.error('Error getting schedules by week type:', error);
    throw error;
  }
};

export const initializeSystem = async () => {
  try {
    const response = await api.post('/initialize_system/');
    return response.data;
  } catch (error) {
    console.error('Error initializing system:', error);
    throw error;
  }
};

export const getSystemStatus = async () => {
  try {
    const response = await api.get('/system_status/');
    return response.data;
  } catch (error) {
    console.error('Error getting system status:', error);
    throw error;
  }
};

// ✅ Filter schedules
export const getCurrentWeekSchedules = async () => {
  return getSchedulesByWeekType('current');
};

export const getUpcomingWeekSchedules = async () => {
  return getSchedulesByWeekType('upcoming');
};

// ✅ Check if system needs initialization
export const checkAndInitialize = async () => {
  try {
    const status = await getSystemStatus();
    
    // If current week has no schedules, initialize
    if (!status.current_week.has_schedules) {
      return await initializeSystem();
    }
    
    return { status: 'already_initialized', data: status };
  } catch (error) {
    console.error('Error checking/initializing system:', error);
    throw error;
  }
};