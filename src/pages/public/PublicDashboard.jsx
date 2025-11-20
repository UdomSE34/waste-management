import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [, setHotels] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({
    totalKg: 0,
    totalPayments: 0,
  });
  const [documents, setDocuments] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: "all", name: "All Documents" },
    { id: "reports", name: "Reports" },
    { id: "payments", name: "Payments" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [hotelData, summaryData, docsData] = await Promise.all([
          getHotels().catch(() => []),
          getMonthlySummary(selectedMonth).catch(() => []),
          getDocuments().catch(() => []),
        ]);

        setHotels(hotelData || []);

        /** Monthly summary */
        if (Array.isArray(summaryData)) {
          const totalKg = summaryData.reduce(
            (sum, item) => sum + (item.total_processed_waste || 0),
            0
          );
          const totalPayments = summaryData.reduce(
            (sum, item) => sum + (parseFloat(item.total_processed_payment) || 0),
            0
          );

          setMonthlySummary({ totalKg, totalPayments });

          /** Generate chart for all months (Jan–Dec) */
          const months = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(new Date().getFullYear(), i, 1);
            const monthLabel = date.toLocaleString("default", { month: "short" });

            const matchingMonth = summaryData.find((item) => {
              if (!item.month) return false;
              const d = new Date(item.month);
              return (
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear()
              );
            });

            return {
              name: monthLabel,
              waste: matchingMonth?.total_processed_waste || 0,
              payment: parseFloat(matchingMonth?.total_processed_payment) || 0,
            };
          });

          setChartData(months);
        }

        setDocuments(docsData || []);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  /** Filter documents by category + search */
  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === "all" || doc?.category === selectedCategory;

    const matchesSearch =
      doc?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  /** Icons for different file types */
  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "pdf":
        return <i className="bi bi-file-earmark-pdf file-icon pdf"></i>;
      case "doc":
      case "docx":
        return <i className="bi bi-file-earmark-word file-icon doc"></i>;
      case "xlsx":
      case "xls":
        return <i className="bi bi-file-earmark-excel file-icon xlsx"></i>;
      default:
        return <i className="bi bi-file-earmark file-icon"></i>;
    }
  };

  const formatDate = (date) => {
    if (!date) return "Unknown date";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const openDocument = (doc) => setSelectedDocument(doc);
  const closeDocument = () => setSelectedDocument(null);

  /** ============== LOADING SCREEN ============== */
  if (loading) {
    return (
      <div className="dashboard">
        <div className="main-content-public">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  /** ============== ERROR SCREEN ============== */
  if (error) {
    return (
      <div className="dashboard">
        <div className="main-content-public">
          <div className="error-container">
            <i className="bi bi-exclamation-triangle"></i>
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  /** ============= DASHBOARD VIEW ============ */
  const renderDashboard = () => (
    <>
      <div className="stats-cards">
        <div className="card stat-card">
          <div className="stat-icon blue">
            <i className="bi bi-trash3"></i>
          </div>
          <div className="stat-info">
            <h3>{monthlySummary.totalKg.toLocaleString()} L</h3>
            <p>Total Waste Collected</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon green">
            <i className="bi bi-cash-coin"></i>
          </div>
          <div className="stat-info">
            <h3>TZS {monthlySummary.totalPayments.toLocaleString()}</h3>
            <p>Total Payments</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Monthly Waste & Payment Trends</h3>
          <select
            value={selectedMonth}
            className="filter-select"
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(new Date().getFullYear(), i, 2);
              return (
                <option key={i} value={date.toISOString().slice(0, 7)}>
                  {date.toLocaleString("default", { month: "long" })}
                </option>
              );
            })}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="waste" fill="#1e3a5f" name="Waste (L)" />
            <Bar dataKey="payment" fill="#28a745" name="Payments (TZS)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  /** ============= DOCUMENTS VIEW ============ */
  const renderDocuments = () => (
    <>
      <div className="card">
        <h3>ForsterInvestment Documents</h3>
        <p>Download shared reports and payment files.</p>
      </div>

      <div className="viewer-controls">
        <input
          type="text"
          placeholder="Search documents..."
          className="filter-select"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={selectedCategory === cat.id ? "active" : ""}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="documents-grid">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-icon">{getFileIcon(doc.type)}</div>

              <div className="document-info">
                <h3>{doc.name}</h3>
                <small>{formatDate(doc.uploadDate)} • {doc.size}</small>
                <span className="document-category">{doc.category}</span>
              </div>

              <div className="document-actions">
                <button onClick={() => openDocument(doc)}>
                  <i className="bi bi-eye"></i> View
                </button>

                <button onClick={() => downloadDocument(doc.url)}>
                  <i className="bi bi-download"></i> Download
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-documents">
            <i className="bi bi-file-earmark"></i>
            <p>No matching documents.</p>
          </div>
        )}
      </div>

      {/* Modal */}
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
                <p>No preview available. Download to view file.</p>

                <button
                  className="btn-download-large"
                  onClick={() => downloadDocument(selectedDocument.url)}
                >
                  <i className="bi bi-download"></i> Download File
                </button>
              </div>

              <div className="document-details">
                <h4>Document Details</h4>
                <p><strong>Type:</strong> {selectedDocument.type}</p>
                <p><strong>Category:</strong> {selectedDocument.category}</p>
                <p><strong>Uploaded:</strong> {formatDate(selectedDocument.uploadDate)}</p>
                <p><strong>Size:</strong> {selectedDocument.size}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="dashboard">
      <div className="sidebar-public">
        <div className="logo-public">
          <i className="bi bi-trash3"></i>
          <h1>ForsterInvestment</h1>
        </div>

        {["dashboard", "documents"].map((menu) => (
          <div
            key={menu}
            className={`menu-item-public ${activeMenu === menu ? "active" : ""}`}
            onClick={() => setActiveMenu(menu)}
          >
            {menu === "dashboard" && <i className="bi bi-house-door"></i>}
            {menu === "documents" && <i className="bi bi-file-earmark"></i>}
            <span>{menu.charAt(0).toUpperCase() + menu.slice(1)}</span>
          </div>
        ))}

        <div className="menu-item-public logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </div>
      </div>

      <div className="main-content-public">
        <div className="header-public">
          <h2>Baraza La Mji Mkoa wa Kusini</h2>
        </div>

        {activeMenu === "dashboard" && renderDashboard()}
        {activeMenu === "documents" && renderDocuments()}
      </div>
    </div>
  );
};

export default PublicDashboard;
