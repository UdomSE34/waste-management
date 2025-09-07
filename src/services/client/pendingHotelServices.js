import axios from "axios";

// Retrieves all pending hotels from backend
export const getPendingHotels = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/pending-hotels/");
    if (!Array.isArray(response.data)) {
      console.error("Expected an array of hotels, got:", response.data);
      return [];
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching pending hotels:", error);
    return [];
  }
};
