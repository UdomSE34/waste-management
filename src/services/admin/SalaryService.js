import axios from 'axios';

const API_URL = '/api/salary/';

// ---------- Salary Endpoints ----------
export const fetchUsersWithSalaries = async (month, year) => {
  try {
    const response = await axios.get(`${API_URL}users-with-salaries/`, {
      params: { month, year },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching users with salaries:", error);
    throw error;
  }
};

export const fetchRolePolicies = async () => {
  try {
    const response = await axios.get(`${API_URL}role-salary-policies/`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching role policies:", error);
    throw error;
  }
};

export const calculateMonthlySalaries = async (month, year) => {
  try {
    const response = await axios.post(`${API_URL}users-with-salaries/calculate_salaries/`, {
      month,
      year,
    });
    return response.data;
  } catch (error) {
    console.error("Error calculating monthly salaries:", error);
    throw error;
  }
};

// Mark salary as Paid / Unpaid
export const updateSalaryStatus = async (salaryId, status) => {
  try {
    // Determine which action to call based on status
    const action = status === "Paid" ? "mark_paid" : "mark_unpaid";

    const response = await axios.patch(`${API_URL}salaries/${salaryId}/${action}/`);
    return response.data;
  } catch (error) {
    console.error("Error updating salary status:", error);
    throw error;
  }
};

// Get individual salary
export const getUserSalary = async (userId, month, year) => {
  try {
    const response = await axios.get(`${API_URL}user-salary/${userId}/`, {
      params: { month, year },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user salary:", error);
    throw error;
  }
};

// Update individual salary
export const updateUserSalary = async (userId, salaryData) => {
  try {
    const response = await axios.put(`${API_URL}user-salary/${userId}/`, salaryData);
    return response.data;
  } catch (error) {
    console.error("Error updating user salary:", error);
    throw error;
  }
};

// ---------- Attendance Endpoints ----------
export const getAttendanceRecords = async (userId = null, month, year) => {
  try {
    const response = await axios.get(`${API_URL}attendance/`, {
      params: { user: userId, month, year },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw error;
  }
};

export const createAttendance = async (attendanceData) => {
  try {
    const response = await axios.post(`${API_URL}attendance/`, attendanceData);
    return response.data;
  } catch (error) {
    console.error("Error creating attendance record:", error);
    throw error;
  }
};

export const updateAttendance = async (attendanceId, status, comment = "") => {
  try {
    const response = await axios.patch(`${API_URL}attendance/${attendanceId}/`, {
      status,
      comment,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating attendance record:", error);
    throw error;
  }
};

export const deleteAttendance = async (attendanceId) => {
  try {
    const response = await axios.delete(`${API_URL}attendance/${attendanceId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    throw error;
  }
};

// ✅ NEW: Generate monthly attendance for all users (except admins)
export const generateMonthlyAttendance = async (month, year) => {
  try {
    const response = await axios.post(`${API_URL}attendance/generate/`, {
      month,
      year,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating monthly attendance:", error);
    throw error;
  }
};

// ---------- Export as default ----------
const salaryService = {
  fetchUsersWithSalaries,
  fetchRolePolicies,
  calculateMonthlySalaries,
  updateSalaryStatus,
  getUserSalary,
  updateUserSalary,
  getAttendanceRecords,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  generateMonthlyAttendance, // 👈 added here
};

export default salaryService;
