// services/invoiceService.js
import axios from "axios";

// Axios instance
export const api = axios.create({
  baseURL: "/api",
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

// Fetch all invoices
export const fetchInvoices = async () => {
  try {
    const res = await api.get("/invoices/");
    return Array.isArray(res.data)
      ? res.data
      : res.data.results ?? [];
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return [];
  }
};

// Send an invoice
export const sendInvoice = async (invoiceId, { amount, month, year }) => {
  try {
    const res = await api.post(`/invoices/${invoiceId}/send_invoice/`, {
      amount,
      month,
      year,
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to send invoice ${invoiceId}:`, error);
    throw error;
  }
};

// Mark invoice as received
export const markReceived = async (invoiceId) => {
  try {
    const res = await api.post(`/invoices/${invoiceId}/mark_received/`);
    return res.data;
  } catch (error) {
    console.error(`Failed to mark invoice ${invoiceId} as received:`, error);
    throw error;
  }
};

// Fetch invoices by hotel
export const fetchInvoicesByHotel = async (hotelId) => {
  try {
    const res = await api.get(`/invoices/by_hotel/?hotel_id=${hotelId}`);
    return Array.isArray(res.data) ? res.data : res.data.results ?? [];
  } catch (error) {
    console.error(`Failed to fetch invoices for hotel ${hotelId}:`, error);
    return [];
  }
};

// ✅ Generate invoices for a given month/year (YYYY-MM)
export const generateInvoicesForMonth = async ({ year, month }) => {
  try {
    // Convert month/year to "YYYY-MM" string
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;

    const res = await api.post("/invoices/generate_for_month/", { month: monthStr });
    return res.data; // { detail: "X invoices generated for YYYY-MM" }
  } catch (error) {
    console.error("Failed to generate invoices for month:", error);
    throw error;
  }
};

