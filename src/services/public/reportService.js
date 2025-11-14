import axios from 'axios';

//  const API_URL = 'http://localhost:8000/api/public'; // Public endpoints
const API_URL = 'https://back.deploy.tz/api/public'; // Public endpoints


// -----------------------------
// Fetch all hotels
// -----------------------------
export const getHotels = async () => {
  try {
    const response = await axios.get(`${API_URL}/hotels/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return [];
  }
};

// -----------------------------
// Fetch monthly summary by month
// -----------------------------
export const getMonthlySummary = async (month) => {
  try {
    const response = await axios.get(`${API_URL}/monthly-summary/?month=${month}`);
    return response.data; // returns MonthlySummary objects
  } catch (error) {
    console.error(`Error fetching monthly summary for ${month}:`, error);
    return [];
  }
};

// -----------------------------
// Fetch all documents (from MonthlySummary reports)
// -----------------------------
export const getDocuments = async () => {
  try {
    const response = await axios.get(`${API_URL}/monthly-summary/`);
    const summaries = response.data;

    // Transform MonthlySummary reports into "documents"
    const documents = summaries.map(summary => {
      const docs = [];
      const monthName = new Date(summary.month + 1).toLocaleString('default', { month: 'long', year: 'numeric' });

      if (summary.processed_waste_report) {
        docs.push({
          id: summary.summary_id,
          name: `Waste Report - ${monthName}`,
          type: 'pdf',
          category: 'reports',
          uploadDate: summary.updated_at || summary.created_at,
          size: 'N/A', // optional: calculate size if needed
          url: summary.processed_waste_report
        });
      }

      if (summary.processed_payment_report) {
        docs.push({
          id: summary.summary_id + '_payment',
          name: `Payment Report - ${monthName }`,
          type: 'pdf',
          category: 'payments',
          uploadDate: summary.updated_at || summary.created_at,
          size: 'N/A',
          url: summary.processed_payment_report
        });
      }

      return docs;
    }).flat(); // flatten nested arrays

    return documents;

  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};

// -----------------------------
// Download document
// -----------------------------
export const downloadDocument = (url) => {
  window.open(url, '_blank');
};
