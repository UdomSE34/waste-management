// pages/admin/SalaryDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  fetchUsersWithSalaries,
  fetchRolePolicies,
  calculateMonthlySalaries,
  updateSalaryStatus,
} from "../../services/admin/SalaryService";
import DataTable from "../../components/admin/DataTable";
import "../../css/admin/SalaryManagement.css";
import axios from "axios";

const SalaryDashboard = () => {
  const [users, setUsers] = useState([]);
  const [, setRolePolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [error, setError] = useState(null);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, policiesData] = await Promise.all([
        fetchUsersWithSalaries(selectedMonth, selectedYear),
        fetchRolePolicies(),
      ]);

      // Filter only active users from API
      const activeUsers = (usersData || []).filter(u => u.status === "Active" || u.is_active);
      setUsers(activeUsers);
      setRolePolicies(policiesData || []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load salary data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateSalaries = async () => {
    try {
      setError(null);
      await calculateMonthlySalaries(selectedMonth, selectedYear);
      await loadData();
      setShowCalculateModal(false);
    } catch (err) {
      console.error("Error calculating salaries:", err);
      setError("Failed to calculate salaries. Please check attendance and policies.");
    }
  };

  const toggleSalaryStatus = async (salary) => {
    if (!salary) return;
    try {
      const newStatus = salary.status === "Paid" ? "Unpaid" : "Paid";
      const updatedSalary = await updateSalaryStatus(salary.salary_id, newStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.salary?.salary_id === updatedSalary.salary_id ? { ...u, salary: updatedSalary } : u
        )
      );
    } catch (err) {
      console.error("Error updating salary status:", err);
      setError("Failed to update salary status.");
    }
  };

  // Token-aware Axios instance

  const api = axios.create({
    baseURL: "/api/salary/",
    timeout: 10000,
  });
  
  // Attach token automatically
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers["Authorization"] = `Token ${token}`;
        config.headers["Content-Type"] = "application/json";
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

 const handleExportPDF = async () => {
  try {
    const response = await api.get("salaries/export_pdf/", {
      responseType: "blob", // important for binary
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "salaries.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("PDF export failed:", err.response?.data || err.message);
  }
};


  if (loading) return <div className="loading">Loading salary data...</div>;

  return (
    <div className="content">
      <div className="page-header">
        <h2>Salary Management</h2>
        <div className="header-actions">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="filter-select"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="filter-select"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleExportPDF}>Export Salaries PDF</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header"><h3>Total Payroll</h3></div>
          <h4>
            {users
              .reduce((total, user) => total + parseFloat(user.salary?.total_salary || 0), 0)
              .toLocaleString("en-US", { style: "currency", currency: "Tsh" })}
          </h4>
        </div>
        <div className="card">
          <div className="card-header"><h3>Employees</h3></div>
          <h4 className="count">{users.length}</h4>
        </div>
        <div className="card">
          <div className="card-header"><h3>Average Salary</h3></div>
          <h4 className="amount">
            {(
              users.reduce((total, user) => total + parseFloat(user.salary?.total_salary || 0), 0) /
              (users.length || 1)
            ).toLocaleString("en-US", { style: "currency", currency: "Tsh" })}
          </h4>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Employee Salaries - {months[selectedMonth - 1]} {selectedYear}</h3>
        </div>
        <DataTable
          columns={[
            "Name","Role","Base Salary","Bonuses","Deductions","Total Salary","Absences","Status","Actions"
          ]}
          rows={users.map((user) => ({
            Name: user.name,
            Role: user.role,
            "Base Salary": user.salary?.base_salary
              ? `$${parseFloat(user.salary.base_salary).toLocaleString()}`
              : "-",
            Bonuses: user.salary?.bonuses
              ? `$${parseFloat(user.salary.bonuses).toLocaleString()}`
              : "-",
            Deductions: user.salary?.deductions
              ? `$${parseFloat(user.salary.deductions).toLocaleString()}`
              : "-",
            "Total Salary": user.salary?.total_salary
              ? `$${parseFloat(user.salary.total_salary).toLocaleString()}`
              : "-",
            Absences: user.absences || 0, // NEW column for number of absent days
            Status: user.salary?.status || "-",
            Actions: user.salary ? (
              <button
                className="btn btn-outline"
                onClick={() => toggleSalaryStatus(user.salary)}
              >
                {user.salary.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}
              </button>
            ) : (
              <button className="btn btn-outline" disabled>Pending</button>
            ),
          }))}
        />
      </div>

      {showCalculateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Calculate Salaries</h3>
            <p>Calculate salaries for {months[selectedMonth - 1]} {selectedYear}?</p>
            <p className="warning-text">
              This will calculate salaries based on attendance records and role policies.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowCalculateModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCalculateSalaries}>Calculate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryDashboard;
