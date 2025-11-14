// pages/admin/AttendanceDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  getAttendanceRecords,
  updateAttendance,
} from "../../services/admin/SalaryService";
import DataTable from "../../components/admin/DataTable";
import "../../css/admin/SalaryManagement.css";

const AttendanceDashboard = () => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);
  const [usersAttendance, setUsersAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // For status/comment modal
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [commentText, setCommentText] = useState("");

  // For emergency modal
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState(""); // Selected emergency status

  // For read-only comment modal (Details column)
  const [showViewCommentModal, setShowViewCommentModal] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // ✅ Load and filter attendance (excluding Council)
  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await getAttendanceRecords(null, selectedMonth, selectedYear);

      const filtered = data.filter(
        (r) =>
          r.date === selectedDate &&
          r.user_status === "active" &&
          !r.role?.toLowerCase().includes("council") && // Exclude Council by role
          !r.name?.toLowerCase().includes("council")    // Safety: Exclude if name includes "Council"
      );

      setUsersAttendance(filtered || []);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedMonth, selectedYear, selectedDate]);

  // Open status update modal (with comment input)
  const handleOpenStatusModal = (attendance, newStatus) => {
    setSelectedAttendance({ ...attendance, newStatus });
    setCommentText(attendance.comment || "");
    setShowCommentModal(true);
  };

  const handleSubmitStatus = async () => {
    if (!selectedAttendance) return;
    try {
      await updateAttendance(
        selectedAttendance.attendance_id,
        selectedAttendance.newStatus || selectedAttendance.status,
        commentText
      );
      setShowCommentModal(false);
      setSelectedAttendance(null);
      setCommentText("");
      await loadAttendance();
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  // Emergency modal
  const handleEmergencyClick = (attendance) => {
    setSelectedAttendance(attendance);
    setCommentText("");
    setEmergencyStatus("");
    setShowEmergencyModal(true);
  };

  const handleSubmitEmergency = async () => {
    if (!selectedAttendance || !emergencyStatus) return;
    try {
      await updateAttendance(selectedAttendance.attendance_id, emergencyStatus, commentText);
      setShowEmergencyModal(false);
      setSelectedAttendance(null);
      setCommentText("");
      setEmergencyStatus("");
      await loadAttendance();
    } catch (error) {
      console.error("Error updating emergency attendance:", error);
    }
  };

  // View-only comment modal (Details column)
  const handleViewComment = (attendance) => {
    setSelectedAttendance(attendance);
    setShowViewCommentModal(true);
  };

  if (loading) return <div className="loading">Loading attendance data...</div>;

  return (
    <div className="content">
      <div className="page-header">
        <h2>Attendance Dashboard</h2>
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
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="filter-select"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="filter-select"
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Attendance Records</h3>
        </div>

        <DataTable
          columns={['Employee', 'Role', 'Date', 'Status', 'Details', 'Actions', 'Emergency']}
          rows={usersAttendance.map(record => ({
            Employee: record.name || "-",
            Role: record.role || "-",
            Date: record.date,
            Status: record.status,
            Details: (
              <button
                className="btn btn-outline"
                onClick={() => handleViewComment(record)}
              >
                View
              </button>
            ),
            Actions: (
              <div className="flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenStatusModal(record, "present")}
                >
                  Present
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleOpenStatusModal(record, "absent")}
                >
                  Absent
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => handleOpenStatusModal(record, "sick")}
                >
                  Sick
                </button>
              </div>
            ),
            Emergency: (
              <button
                className="btn btn-secondary"
                onClick={() => handleEmergencyClick(record)}
              >
                Emergency
              </button>
            ),
          }))}
        />
      </div>

      {/* Status Update Modal */}
      {showCommentModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Update Status: {selectedAttendance?.newStatus}</h3>
            <div className="form-group">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter comment..."
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCommentModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmitStatus}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Emergency Attendance for {selectedAttendance?.name}</h3>
            <p>Select type and optionally add a comment:</p>
            <div className="form-group">
              <select
                value={emergencyStatus}
                onChange={(e) => setEmergencyStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">-- Select --</option>
                <option value="accident">Accident</option>
                <option value="off">Off</option>
              </select>
            </div>
            <div className="form-group">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter comment..."
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEmergencyModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmitEmergency}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Comment Modal (read-only) */}
      {showViewCommentModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Attendance Comment</h3>
            <p>{selectedAttendance?.comment || "No comment available."}</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowViewCommentModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
