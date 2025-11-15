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
// Fetch all documents (from MonthlySummary reports) - 🔥 UPDATED
// -----------------------------
export const getDocuments = async () => {
  try {
    console.log("🔄 Fetching documents from:", `${API_URL}/documents/`);
    const response = await axios.get(`${API_URL}/documents/`);
    
    // 🔥 DEBUG: See what the API actually returns
    console.log("📄 RAW DOCUMENTS API RESPONSE:", response.data);
    
    let data = response.data;
    
    // Handle different response formats
    if (data.results) {
      data = data.results; // Paginated response
      console.log("📊 Paginated data results:", data);
    }
    
    // 🔥 TRANSFORM DATA to match frontend expectations
    const transformedDocuments = data.map((item, index) => {
      console.log(`📋 Processing item ${index}:`, item);
      
      // Extract month name safely
      let monthName = 'Unknown Month';
      try {
        if (item.month) {
          monthName = new Date(item.month).toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
          });
        }
      } catch (e) {
        console.error("Error parsing month:", e);
      }
      
      const documents = [];
      
      // 🔥 CHECK ALL POSSIBLE FILE FIELD NAMES
      const wasteReport = item.processed_waste_report || item.waste_report_url;
      const paymentReport = item.processed_payment_report || item.payment_report_url;
      
      console.log(`📎 File check for ${monthName}:`, {
        wasteReport: !!wasteReport,
        paymentReport: !!paymentReport,
        wasteReportValue: wasteReport,
        paymentReportValue: paymentReport
      });
      
      // Create document for waste report if it exists
      if (wasteReport) {
        documents.push({
          id: item.summary_id || item.id || `waste_${index}`,
          name: `Waste Report - ${monthName}`,
          type: 'pdf',
          category: 'reports',
          uploadDate: item.updated_at || item.created_at || new Date().toISOString(),
          size: 'N/A',
          url: wasteReport
        });
      }
      
      // Create document for payment report if it exists
      if (paymentReport) {
        documents.push({
          id: (item.summary_id || item.id || `payment_${index}`) + '_payment',
          name: `Payment Report - ${monthName}`,
          type: 'pdf',
          category: 'payments',
          uploadDate: item.updated_at || item.created_at || new Date().toISOString(),
          size: 'N/A',
          url: paymentReport
        });
      }
      
      return documents;
    }).flat(); // Flatten array of arrays into single array
    
    console.log("🎯 FINAL TRANSFORMED DOCUMENTS:", transformedDocuments);
    return transformedDocuments;
    
  } catch (error) {
    console.error("❌ Error fetching documents:", error);
    console.error("Error details:", error.response?.data);
    
    // 🔥 IMPROVED FALLBACK: Try monthly-summary as fallback
    try {
      console.log("🔄 Trying fallback with monthly summaries...");
      const summaries = await getMonthlySummary();
      console.log("📊 Fallback summaries:", summaries);
      
      const fallbackDocuments = summaries.map((summary, index) => {
        let monthName = 'Unknown Month';
        try {
          if (summary.month) {
            monthName = new Date(summary.month).toLocaleString('default', { 
              month: 'long', 
              year: 'numeric' 
            });
          }
        } catch (e) {
          console.error("Error parsing month in fallback:", e);
        }
        
        const docs = [];
        
        // Check for waste report in fallback
        const wasteReport = summary.processed_waste_report || summary.waste_report_url;
        if (wasteReport) {
          docs.push({
            id: (summary.summary_id || summary.id || `fallback_waste_${index}`),
            name: `Waste Report - ${monthName}`,
            type: 'pdf',
            category: 'reports',
            uploadDate: summary.updated_at || summary.created_at || new Date().toISOString(),
            size: 'N/A',
            url: wasteReport
          });
        }
        
        // Check for payment report in fallback
        const paymentReport = summary.processed_payment_report || summary.payment_report_url;
        if (paymentReport) {
          docs.push({
            id: (summary.summary_id || summary.id || `fallback_payment_${index}`) + '_payment',
            name: `Payment Report - ${monthName}`,
            type: 'pdf',
            category: 'payments',
            uploadDate: summary.updated_at || summary.created_at || new Date().toISOString(),
            size: 'N/A',
            url: paymentReport
          });
        }
        
        return docs;
      }).flat();
      
      console.log("📦 FALLBACK DOCUMENTS:", fallbackDocuments);
      return fallbackDocuments;
      
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      return [];
    }
  }
};

// -----------------------------
// Download document - 🔥 IMPROVED
// -----------------------------
export const downloadDocument = (url) => {
  if (!url) {
    alert("Document URL not available");
    return;
  }
  
  console.log("📥 Downloading document from URL:", url);
  
  // Ensure URL is absolute
  let finalUrl = url;
  if (url.startsWith('/media/')) {
    finalUrl = `https://back.deploy.tz${url}`;
  } else if (url.startsWith('media/')) {
    finalUrl = `https://back.deploy.tz/${url}`;
  } else if (!url.startsWith('http')) {
    finalUrl = `https://back.deploy.tz${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  console.log("🌐 Final download URL:", finalUrl);
  window.open(finalUrl, '_blank');
};