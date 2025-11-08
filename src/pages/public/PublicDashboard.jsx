import React, { useState, useEffect } from "react";
import {
  FaTrashAlt,
  FaHotel,
  FaMoneyBillWave,
  FaWeightHanging,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaTimes,
  FaHome,
} from "react-icons/fa6";
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
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
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

  const categories = [
    { id: "all", name: "All Documents" },
    { id: "reports", name: "Reports" },
    { id: "payments", name: "Payments" },
  ];

  useEffect(() => {
    getHotels()
      .then((data) => setHotels(data))
      .catch((err) => console.error("Hotels fetch error:", err));

    getMonthlySummary(selectedMonth)
      .then((data) => {
        const totalKg = data.reduce(
          (sum, item) =>
            sum +
            (item.total_actual_waste || 0) +
            (item.total_processed_waste || 0),
          0
        );
        const totalPayments = data.reduce(
          (sum, item) =>
            sum +
            (parseFloat(item.total_actual_payment) || 0) +
            (parseFloat(item.total_processed_payment) || 0),
          0
        );
        setMonthlySummary({ totalKg, totalPayments });

        const months = Array.from({ length: 12}, (_, i) => {
          const date = new Date(new Date().getFullYear(), i, 1);
          const monthLabel = date.toLocaleString("default", { month: "short" });
          const monthData = data.find(
            (item) =>
              new Date(item.month).getMonth() === date.getMonth() - 1 &&
              new Date(item.month).getFullYear() === date.getFullYear()
          );

          return {
            name: monthLabel,
            waste:
              (monthData?.total_actual_waste || 0) +
              (monthData?.total_processed_waste || 0),
            payment:
              (parseFloat(monthData?.total_actual_payment) || 0) +
              (parseFloat(monthData?.total_processed_payment) || 0),
          };
        });
        setChartData(months);
      })
      .catch((err) => console.error("Monthly summary fetch error:", err));

    getDocuments()
      .then((data) => setDocuments(data))
      .catch((err) => console.error("Documents fetch error:", err));
  }, [selectedMonth]);

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
        return <FaFilePdf className="file-icon pdf" />;
      case "doc":
      case "docx":
        return <FaFileWord className="file-icon doc" />;
      case "xlsx":
      case "xls":
        return <FaFileExcel className="file-icon xlsx" />;
      default:
        return <FaFileAlt className="file-icon" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const openDocument = (doc) => setSelectedDocument(doc);
  const closeDocument = () => setSelectedDocument(null);

  const renderDashboard = () => (
    <>
      <div className="stats-cards">
        <div className="card stat-card">
          <div className="stat-icon blue">
            <FaWeightHanging />
          </div>
          <div className="stat-info">
            <h3>{monthlySummary.totalKg.toLocaleString()} kg</h3>
            <p>Total Waste Collected</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <h3>TZS {monthlySummary.totalPayments.toLocaleString()}</h3>
            <p>Total Payments</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon orange">
            <FaHotel />
          </div>
          <div className="stat-info">
            <h3>{hotels.length}</h3>
            <p>Customers Serviced</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Monthly Waste & Payment Trends</h3>
          <div className="chart-actions">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(new Date().getFullYear(), i, 1);
                const monthValue = date.toISOString().slice(0, 7) ;
                return (
                  <option key={i} value={monthValue}>
                    {date.toLocaleString("default", { month: "long" })}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="waste" fill="#1e3a5f" name="Waste (kg)" />
            <Bar dataKey="payment" fill="#28a745" name="Payments (TZS)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>
          Our Customers Summary -{" "}
          {new Date(selectedMonth + "-02").toLocaleString("default", {
            month: "long",
          })}
        </h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Hadhi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {hotels.slice(0, 5).map((hotel) => (
              <tr key={hotel.id}>
                <td>{hotel.name}</td>
                <td>{hotel.address || "N/A"}</td>
                <td>{hotel.contact_phone || "N/A"}</td>
                <td>{hotel.hadhi || "N/A"}</td>
                <td>
                  <span className={`status ${hotel.status || ""}`}>
                    {hotel.status
                      ? hotel.status.charAt(0).toUpperCase() +
                        hotel.status.slice(1)
                      : "N/A"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderDocuments = () => (
    <>
      <div className="card">
        <h3>ForsterInvestment Documents</h3>
        <p>Access reports, payment summaries shared by ForsterInvestment</p>
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
        {filteredDocuments.length > 0 ? (
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
                  <FaEye /> View
                </button>
                <button
                  className="btn-download"
                  onClick={() => downloadDocument(doc.url)}
                >
                  <FaDownload /> Download
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-documents">
            <FaFileAlt />
            <p>No documents found matching your criteria</p>
          </div>
        )}
      </div>

      {/* 🔹 Document Modal */}
      {selectedDocument && (
        <div className="document-modal" onClick={closeDocument}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{selectedDocument.name}</h3>
              <button className="close-btn" onClick={closeDocument}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="document-preview">
                {getFileIcon(selectedDocument.type)}
                <p>
                  Preview not available. Click below to download and view this
                  file.
                </p>
                <button
                  className="btn-download-large"
                  onClick={() => downloadDocument(selectedDocument.url)}
                >
                  <FaDownload /> Download File
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

  const renderCustomers = () => (
    <div className="card">
      <h3>All Customers</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Hadhi</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel) => (
            <tr key={hotel.id}>
              <td>{hotel.name}</td>
              <td>{hotel.address || "N/A"}</td>
              <td>{hotel.contact_phone || "N/A"}</td>
              <td>{hotel.hadhi || "N/A"}</td>
              <td>
                <span className={`status ${hotel.status || ""}`}>
                  {hotel.status
                    ? hotel.status.charAt(0).toUpperCase() +
                      hotel.status.slice(1)
                    : "N/A"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="sidebar-public">
        <div className="logo-public">
          <FaTrashAlt />
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
            {{
              dashboard: <FaHome />,
              documents: <FaFileAlt />,
              customers: <FaHotel />,
            }[menu]}
            <span>{menu.charAt(0).toUpperCase() + menu.slice(1)}</span>
          </div>
        ))}
      </div>

      <div className="main-content-public">
        <div className="header-public">
          <h2>Baraza La Mji Mkoa wa Kusini</h2>
        </div>

        {activeMenu === "dashboard" && renderDashboard()}
        {activeMenu === "documents" && renderDocuments()}
        {activeMenu === "customers" && renderCustomers()}
      </div>
    </div>
  );
};

export default PublicDashboard;
