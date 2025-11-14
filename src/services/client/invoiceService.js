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

// Fetch all invoices for the logged-in client
export const fetchClientInvoices = async () => {
  try {
    const res = await api.get("/invoices/");
    return Array.isArray(res.data) ? res.data : res.data.results ?? [];
  } catch (error) {
    console.error("Failed to fetch client invoices:", error);
    return [];
  }
};

/**
 * Mark invoice as received AND download PDF
 * @param {string} invoiceId - ID of the invoice
 * @param {object} param1 - { comment: string }
 */
export const markInvoiceReceived = async (invoiceId, { comment }) => {
  try {
    // Fetch PDF + mark received
    const res = await api.post(
      `/invoices/${invoiceId}/mark_received_and_download/`,
      { comment },
      { responseType: "blob" } // important to handle PDF
    );

    // Create blob and trigger download
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${invoiceId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error(`Failed to mark invoice ${invoiceId} as received:`, error);
    throw error;
  }
};
