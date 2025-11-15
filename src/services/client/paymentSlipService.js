import axios from "axios";

const API_URL = "https://back.deploy.tz/api/payment-slips/";
const BASE_MEDIA_URL = "https://back.deploy.tz"; // 🔥 SEPARATE MEDIA URL

export const api = axios.create({
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

// ✅ Get all payment slips
export const fetchPaymentSlips = async () => {
  try {
    const res = await api.get("");
    let slips = [];

    if (Array.isArray(res.data)) {
      slips = res.data;
    } else if (res.data && Array.isArray(res.data.results)) {
      slips = res.data.results;
    } else {
      console.warn("Unexpected API response format:", res.data);
      return [];
    }

    // 🔥 FIXED: Check if URL is already absolute before converting
    slips = slips.map(slip => ({
      ...slip,
      file_url: slip.file ? (isAbsoluteUrl(slip.file) ? slip.file : `${BASE_MEDIA_URL}${slip.file}`) : null,
      receipt_url: slip.receipt ? (isAbsoluteUrl(slip.receipt) ? slip.receipt : `${BASE_MEDIA_URL}${slip.receipt}`) : null
    }));

    return slips;
  } catch (error) {
    console.error("❌ Error fetching payment slips:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// ✅ Add a new payment slip (with file upload)
export const addPaymentSlip = async (formData) => {
  if (!formData || !(formData instanceof FormData)) {
    throw new Error("Invalid formData for payment slip upload");
  }

  try {
    const res = await api.post("", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    // 🔥 FIXED: Check if URL is already absolute
    const slipWithUrls = {
      ...res.data,
      file_url: res.data.file ? (isAbsoluteUrl(res.data.file) ? res.data.file : `${BASE_MEDIA_URL}${res.data.file}`) : null,
      receipt_url: res.data.receipt ? (isAbsoluteUrl(res.data.receipt) ? res.data.receipt : `${BASE_MEDIA_URL}${res.data.receipt}`) : null
    };
    
    return slipWithUrls;
  } catch (error) {
    console.error("❌ Error uploading payment slip:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// ✅ Update a payment slip (with file upload optional)
export const updatePaymentSlip = async (slipId, formData) => {
  if (!slipId) throw new Error("Slip ID is required");
  if (!formData || !(formData instanceof FormData)) {
    throw new Error("Invalid formData for updating payment slip");
  }

  try {
    const res = await api.put(`${slipId}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    // 🔥 FIXED: Check if URL is already absolute
    const slipWithUrls = {
      ...res.data,
      file_url: res.data.file ? (isAbsoluteUrl(res.data.file) ? res.data.file : `${BASE_MEDIA_URL}${res.data.file}`) : null,
      receipt_url: res.data.receipt ? (isAbsoluteUrl(res.data.receipt) ? res.data.receipt : `${BASE_MEDIA_URL}${res.data.receipt}`) : null
    };
    
    return slipWithUrls;
  } catch (error) {
    console.error("❌ Error updating payment slip:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// ✅ Delete a payment slip
export const deletePaymentSlip = async (slipId) => {
  if (!slipId) throw new Error("Slip ID is required");

  try {
    const res = await api.delete(`${slipId}/`);
    return res.data;
  } catch (error) {
    console.error("❌ Error deleting payment slip:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// 🔥 NEW: Direct file download function
export const downloadFile = async (fileUrl) => {
  if (!fileUrl) throw new Error("File URL is required");
  
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(fileUrl, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    throw error;
  }
};

// 🔥 NEW: Helper function to check if URL is already absolute
const isAbsoluteUrl = (url) => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

// 🔥 NEW: Safe file URL converter (use this in your component)
export const getSafeFileUrl = (filePath) => {
  if (!filePath) return null;
  
  if (isAbsoluteUrl(filePath)) {
    return filePath; // Already absolute URL
  } else if (filePath.startsWith('/')) {
    return `${BASE_MEDIA_URL}${filePath}`; // Convert relative to absolute
  } else {
    return `${BASE_MEDIA_URL}/${filePath}`; // Handle missing slash
  }
};