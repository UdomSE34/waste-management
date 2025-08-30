import axios from "axios";

export const getPendingHotels = async () => {
  const res = await axios.get("/api/pending-hotels/");
  return res.data;
};

export const approvePendingHotel = async (id) => {
  const res = await axios.post(`/api/pending-hotels/${id}/approve/`);
  return res.data;
};

export const rejectPendingHotel = async (id) => {
  const res = await axios.post(`/api/pending-hotels/${id}/reject/`);
  return res.data;
};

export const exportPendingHotels = async (format) => {
  const res = await axios.get(`/api/pending-hotels/export/?format=${format}`, {
    responseType: "blob",
  });
  return res.data;
};
