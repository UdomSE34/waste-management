// pages/admin/AttendanceDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  getAttendanceRecords,
  updateAttendance,
  generateMonthlyAttendance
} from "../../services/admin/SalaryService";
import DataTable from "../../components/admin/DataTable";
import '../../css/admin/SalaryManagement.css';

const AttendanceDashboard = () => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);
  const [usersAttendance, setUsersAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [markedStatuses, setMarkedStatuses] = useState({}); // {attendanceId: status}

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await getAttendanceRecords(null, selectedMonth, selectedYear);
      const filtered = data.filter(r => r.date === selectedDate);
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

  const handleGenerateAttendance = async () => {
    try {
      await generateMonthlyAttendance(selectedMonth, selectedYear);
      await loadAttendance();
      setShowGenerateModal(false);
    } catch (error) {
      console.error("Error generating attendance:", error);
    }
  };

  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      const record = usersAttendance.find(r => r.attendance_id === attendanceId);
      await updateAttendance(attendanceId, newStatus, record.comment);
      // update marked status immediately
      setMarkedStatuses(prev => ({ ...prev, [attendanceId]: newStatus }));
      await loadAttendance();
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
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
    <button
            className="btn btn-primary"
            onClick={() => setShowGenerateModal(true)}
          >
            Generate Attendance
          </button>
  </div>
  <DataTable
        columns={['Employee', 'Role', 'Date', 'Status', 'Comment', 'Actions']}
        rows={usersAttendance.map(record => ({
          Employee: record.name || "-",
          Role: record.role || "-",
          Date: record.date,
          Status: record.status,
          Comment: record.comment || "-",
          Actions: (
            <div className="flex gap-2">
              <button
                className={`btn btn-primary ${record.status === 'present' ? 'active' : ''}`}
                onClick={() => handleStatusChange(record.attendance_id, 'present')}
              >
                {markedStatuses[record.attendance_id] === 'present' ? 'Marked' : 'Present'}
              </button>
              <button
                className={`btn btn-danger ${record.status === 'absent' ? 'active' : ''}`}
                onClick={() => handleStatusChange(record.attendance_id, 'absent')}
              >
                {markedStatuses[record.attendance_id] === 'absent' ? 'Marked' : 'Absent'}
              </button>
              <button
                className={`btn btn-sm ${record.status === 'sick' ? 'active' : ''}`}
                onClick={() => handleStatusChange(record.attendance_id, 'sick')}
              >
                {markedStatuses[record.attendance_id] === 'sick' ? 'Marked' : 'Sick'}
              </button>
            </div>
          )
        }))}
      />
</div>
      

      {showGenerateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Generate Attendance</h3>
            <p>
              Generate attendance for all employees (except Admins) in{" "}
              {months[selectedMonth - 1]} {selectedYear}?
            </p>
            <p className="warning-text">
              This will insert attendance for each employee with their role.
              <br />
              Salary deductions will apply for <b>Absent</b> and more than{" "}
              <b>2 Sick days</b>.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowGenerateModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGenerateAttendance}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
