import axios from 'axios';

const API_URL = 'https://back.deploy.tz/api/public';

// -----------------------------
// Fetch all hotels
// -----------------------------
export const getHotels = async () => {
  try {
    const response = await axios.get(`${API_URL}/hotels/`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return [];
  }
};

// -----------------------------
// Fetch monthly summaries
// -----------------------------
export const getMonthlySummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/monthly-summary/`);
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    } else if (response.data.summaries && Array.isArray(response.data.summaries)) {
      return response.data.summaries;
    } else {
      console.warn("Unexpected monthly summary response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
    return [];
  }
};

// -----------------------------
// Fetch all documents (from MonthlySummary reports)
// -----------------------------
export const getDocuments = async () => {
  try {
    const response = await axios.get(`${API_URL}/documents/`);
    
    // If using the new PublicDocumentViewSet
    if (Array.isArray(response.data)) {
      return response.data.map(item => ({
        id: item.month, // Use month as ID
        name: `Monthly Report - ${new Date(item.month).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        type: 'pdf',
        category: 'reports',
        uploadDate: item.updated_at || item.created_at,
        size: 'PDF Document',
        url: item.waste_report_url || item.processed_waste_report
      }));
    }

    // Fallback: Use monthly-summary endpoint
    const summaries = await getMonthlySummary();
    const documents = [];

    summaries.forEach(summary => {
      const monthName = new Date(summary.month).toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
      });

      // Use URL methods if available, otherwise build URL
      const wasteReportUrl = summary.waste_report_url || 
        (summary.processed_waste_report ? `https://back.deploy.tz${summary.processed_waste_report}` : null);
      
      const paymentReportUrl = summary.payment_report_url || 
        (summary.processed_payment_report ? `https://back.deploy.tz${summary.processed_payment_report}` : null);

      if (wasteReportUrl) {
        documents.push({
          id: `${summary.summary_id}_waste`,
          name: `Waste Report - ${monthName}`,
          type: 'pdf',
          category: 'reports',
          uploadDate: summary.updated_at || summary.created_at,
          size: 'PDF Document',
          url: wasteReportUrl
        });
      }

      if (paymentReportUrl) {
        documents.push({
          id: `${summary.summary_id}_payment`,
          name: `Payment Report - ${monthName}`,
          type: 'pdf',
          category: 'payments',
          uploadDate: summary.updated_at || summary.created_at,
          size: 'PDF Document',
          url: paymentReportUrl
        });
      }
    });

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
  if (!url) {
    alert("Document URL not available");
    return;
  }
  
  // Ensure URL is absolute
  let finalUrl = url;
  if (url.startsWith('/media/')) {
    finalUrl = `https://back.deploy.tz${url}`;
  }
  
  window.open(finalUrl, '_blank');
};