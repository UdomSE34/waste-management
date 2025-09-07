import axios from "axios";

const API_URL = "/api/paid-hotels/";

// Fetch all PaidHotelInfo records
export const getPaidHotels = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Mark a hotel as Paid
export const markHotelAsPaid = async (id) => {
  const res = await axios.patch(`${API_URL}${id}/mark_paid/`);
  return res.data;
};

// Mark a hotel as Unpaid
export const markHotelAsUnpaid = async (id) => {
  const res = await axios.patch(`${API_URL}${id}/mark_unpaid/`);
  return res.data;
};

// Export PaidHotelInfo data
export const exportPaidHotels = async (format) => {
  const res = await axios.get(`${API_URL}export_pdf/`, {
    responseType: "blob", // for file download
  });
  return res.data;
};
