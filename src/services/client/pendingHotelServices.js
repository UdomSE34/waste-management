import axios from "axios";

// Retrieves all pending hotels from backend with auth token
export const getPendingHotels = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.warn("No auth token found");
    return [];
  }

  try {
    const response = await axios.get(
      "https://back.deploy.tz/api/pending-hotels/",
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!Array.isArray(response.data)) {
      console.error("Expected an array of hotels, got:", response.data);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching pending hotels:", error.response?.data || error.message);
    return [];
  }
};
