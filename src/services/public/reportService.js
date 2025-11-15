import axios from 'axios';

// 🔥 FOR LOCAL TESTING
const API_URL = 'https://back.deploy.tz/api/public';

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
    const response = await axios.get(`${API_URL}/monthly-summary/`);
    
    // 🔥 FIXED: Handle the response properly
    let data = response.data;
    
    // If it's paginated response
    if (data.results) {
      data = data.results;
    }
    
    // Filter by month if provided
    if (month) {
      data = data.filter(item => {
        const itemMonth = new Date(item.month).toISOString().slice(0, 7);
        return itemMonth === month;
      });
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching monthly summary:`, error);
    return [];
  }
};

// -----------------------------
// Fetch all documents (from MonthlySummary reports)
// -----------------------------
export const getDocuments = async () => {
  try {
    const response = await axios.get(`${API_URL}/documents/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    
    // 🔥 FALLBACK: Try monthly-summary endpoint
    try {
      const summaries = await getMonthlySummary();
      const documents = [];

      summaries.forEach(summary => {
        const monthName = new Date(summary.month).toLocaleString('default', { 
          month: 'long', 
          year: 'numeric' 
        });

        if (summary.processed_waste_report) {
          documents.push({
            id: summary.summary_id,
            name: `Waste Report - ${monthName}`,
            type: 'pdf',
            category: 'reports',
            uploadDate: summary.updated_at || summary.created_at,
            size: 'N/A',
            url: summary.processed_waste_report
          });
        }

        if (summary.processed_payment_report) {
          documents.push({
            id: summary.summary_id + '_payment',
            name: `Payment Report - ${monthName}`,
            type: 'pdf',
            category: 'payments',
            uploadDate: summary.updated_at || summary.created_at,
            size: 'N/A',
            url: summary.processed_payment_report
          });
        }
      });

      return documents;
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return [];
    }
  }
};

// -----------------------------
// Download document
// -----------------------------
export const downloadDocument = (url) => {
  if (!url) {
    alert("Document URL not available");
    return;
  }
  
  // Ensure URL is absolute for local development
  let finalUrl = url;
  if (url.startsWith('/media/')) {
    finalUrl = `https://back.deploy.tz${url}`;
  }
  
  window.open(finalUrl, '_blank');
};