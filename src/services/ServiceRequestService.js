// services/ServiceRequestService.js
import axios from "axios";

const API_URL = "/api/service-requests/"; 
// 👆 adjust path if your DRF endpoint is different

// Fetch all service requests
export const getServiceRequests = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (err) {
    console.error("Error fetching service requests:", err);
    throw err;
  }
};
