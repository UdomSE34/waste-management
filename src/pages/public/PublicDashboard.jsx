import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../../css/public/index.css";
import {
  getHotels,
  getMonthlySummary,
  getDocuments,
  downloadDocument,
} from "../../services/public/reportService";

const PublicDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [hotels, setHotels] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({
    totalKg: 0,
    totalPayments: 0,
  });
  const [documents, setDocuments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "all", name: "All Documents" },
    { id: "reports", name: "Reports" },
    { id: "payments", name: "Payments" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load hotels
      const hotelsData = await getHotels();
      setHotels(hotelsData);

      // Load monthly summaries
      const summaryData = await getMonthlySummary();
      processSummaryData(summaryData);

      // Load documents
      const docsData = await getDocuments();
      setDocuments(docsData);

    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const processSummaryData = (data) => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }

    // Calculate totals from ALL months
    const totalKg = data.reduce(
      (sum, item) => sum + (item.total_processed_waste || 0),
      0
    );
    const totalPayments = data.reduce(
      (sum, item) => sum + (parseFloat(item.total_processed_payment) || 0),
      0
    );
    setMonthlySummary({ totalKg, totalPayments });

    // Prepare simple chart data - use ALL available months
    const chartData = data.map(item => ({
      name: new Date(item.month).toLocaleString("default", { 
        month: "short", 
        year: 'numeric' 
      }),
      waste: item.total_processed_waste || 0,
      payment: parseFloat(item.total_processed_payment) || 0,
    }));

    setChartData(chartData);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <i className="bi bi-file-earmark-pdf file-icon pdf"></i>;
      default:
        return <i className="bi bi-file-earmark file-icon"></i>;
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return "Unknown date";
    }
  };

  const openDocument = (doc) => setSelectedDocument(doc);
  const closeDocument = () => setSelectedDocument(null);

  const handleDownload = (doc) => {
    if (doc.url) {
      downloadDocument(doc.url);
    } else {
      alert("Document URL not available");
    }
  };

  const renderDashboard = () => (
    <>
      <div className="stats-cards">
        <div className="card stat-card">
          <div className="stat-icon blue">
            <i className="bi bi-trash3"></i>
          </div>
          <div className="stat-info">
            <h3>{monthlySummary.totalKg.toLocaleString()} kg</h3>
            <p>Total Waste Processed</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon green">
            <i className="bi bi-cash-coin"></i>
          </div>
          <div className="stat-info">
            <h3>TZS {monthlySummary.totalPayments.toLocaleString()}</h3>
            <p>Total Payments Processed</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon orange">
            <i className="bi bi-building"></i>
          </div>
          <div className="stat-info">
            <h3>{hotels.length}</h3>
            <p>Hotels Serviced</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Waste & Payment Trends</h3>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "waste") return [`${value.toLocaleString()} kg`, "Waste"];
                  if (name === "payment") return [`TZS ${value.toLocaleString()}`, "Payments"];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="waste" fill="#1e3a5f" name="Waste (kg)" />
              <Bar dataKey="payment" fill="#28a745" name="Payments (TZS)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            <p>No data available yet</p>
          </div>
        )}
      </div>
    </>
  );

  const renderDocuments = () => (
    <>
      <div className="card">
        <h3>ForsterInvestment Documents</h3>
        <p>Access reports and payment summaries shared by ForsterInvestment.</p>
      </div>

      <div className="viewer-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category.id}
              className={selectedCategory === category.id ? "active" : ""}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="documents-grid">
        {loading ? (
          <div className="loading">Loading documents...</div>
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-icon">{getFileIcon(doc.type)}</div>
              <div className="document-info">
                <h3>{doc.name}</h3>
                <div className="document-meta">
                  <span>{formatDate(doc.uploadDate)}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>
                <span className="document-category">{doc.category}</span>
              </div>
              <div className="document-actions">
                <button className="btn-view" onClick={() => openDocument(doc)}>
                  <i className="bi bi-eye"></i> View
                </button>
                <button
                  className="btn-download"
                  onClick={() => handleDownload(doc)}
                >
                  <i className="bi bi-download"></i> Download
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-documents">
            <i className="bi bi-file-earmark"></i>
            <p>No documents found matching your criteria.</p>
          </div>
        )}
      </div>

      {selectedDocument && (
        <div className="document-modal" onClick={closeDocument}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDocument.name}</h3>
              <button className="close-btn" onClick={closeDocument}>
                <i className="bi bi-x-circle"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="document-preview">
                {getFileIcon(selectedDocument.type)}
                <p>
                  Click below to download and view this file.
                </p>
                <button
                  className="btn-download-large"
                  onClick={() => handleDownload(selectedDocument)}
                >
                  <i className="bi bi-download"></i> Download File
                </button>
              </div>
              <div className="document-details">
                <h4>Document Details</h4>
                <p>
                  <strong>Type:</strong> {selectedDocument.type.toUpperCase()}
                </p>
                <p>
                  <strong>Category:</strong> {selectedDocument.category}
                </p>
                <p>
                  <strong>Uploaded:</strong>{" "}
                  {formatDate(selectedDocument.uploadDate)}
                </p>
                <p>
                  <strong>Size:</strong> {selectedDocument.size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderCustomers = () => (
    <div className="card">
      <h3>Our Hotel Partners</h3>
      {loading ? (
        <div className="loading">Loading hotels...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Hotel Name</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.id || hotel.hotel_id}>
                <td>{hotel.name || "N/A"}</td>
                <td>{hotel.address || "N/A"}</td>
                <td>{hotel.contact_phone || hotel.phone || "N/A"}</td>
                <td>{hotel.hadhi || hotel.category || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="dashboard">
      <div className="sidebar-public">
        <div className="logo-public">
          <i className="bi bi-trash3"></i>
          <h1>ForsterInvestment</h1>
        </div>

        {["dashboard", "documents", "customers"].map((menu) => (
          <div
            key={menu}
            className={`menu-item-public ${
              activeMenu === menu ? "active" : ""
            }`}
            onClick={() => setActiveMenu(menu)}
          >
            {menu === "dashboard" && <i className="bi bi-house-door"></i>}
            {menu === "documents" && <i className="bi bi-file-earmark"></i>}
            {menu === "customers" && <i className="bi bi-building"></i>}
            <span>{menu.charAt(0).toUpperCase() + menu.slice(1)}</span>
          </div>
        ))}
      </div>

      <div className="main-content-public">
        <div className="header-public">
          <h2>Baraza La Mji Mkoa wa Kusini</h2>
          <p>Transparent Waste Management Reporting</p>
        </div>

        {activeMenu === "dashboard" && renderDashboard()}
        {activeMenu === "documents" && renderDocuments()}
        {activeMenu === "customers" && renderCustomers()}
      </div>
    </div>
  );
};

export default PublicDashboard;