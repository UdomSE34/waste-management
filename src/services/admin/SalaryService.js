import axios from "axios";

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

// ---------- Salary Endpoints ----------
export const updateSalaryStatus = async (salary_id, status) => {
  console.log(`SalaryService: Updating salary ${salary_id} to ${status}`);
  
  if (!salary_id) {
    throw new Error("Salary ID is required for updating status");
  }
  
  const action = status === "Paid" ? "mark_paid" : "mark_unpaid";
  try {
    const res = await api.patch(`salaries/${salary_id}/${action}/`);
    console.log("Update successful:", res.data);
    return res.data;
  } catch (error) {
    console.error(`Error updating salary ${salary_id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const fetchUsersWithSalaries = async (month, year) => {
  try {
    const res = await api.get("users-with-salaries/", { params: { month, year } });
    console.log("Fetched users with salaries:", res.data);
    return res.data || [];
  } catch (error) {
    console.error("Error fetching users with salaries:", error);
    throw error;
  }
};

export const fetchRolePolicies = async () => {
  const res = await api.get("role-salary-policies/");
  return res.data || [];
};

export const calculateMonthlySalaries = async (month, year) => {
  const res = await api.post("users-with-salaries/calculate_salaries/", { month, year });
  return res.data;
};


export const getUserSalary = async (userId, month, year) => {
  const res = await api.get(`user-salary/${userId}/`, { params: { month, year } });
  return res.data;
};

export const updateUserSalary = async (userId, salaryData) => {
  const res = await api.put(`user-salary/${userId}/`, salaryData);
  return res.data;
};

// ---------- Attendance Endpoints ----------
export const getAttendanceRecords = async (userId = null, month, year) => {
  const res = await api.get("attendance/", { params: { user: userId, month, year } });
  return res.data || [];
};

export const createAttendance = async (attendanceData) => {
  const res = await api.post("attendance/", attendanceData);
  return res.data;
};

export const updateAttendance = async (attendanceId, status, comment = "") => {
  const res = await api.patch(`attendance/${attendanceId}/`, { status, comment });
  return res.data;
};

export const markEmergencyAttendance = async (attendanceId, type) => {
  const res = await api.patch(`attendance/${attendanceId}/`, {
    status: type,
    comment: "Marked via Emergency button",
  });
  return res.data;
};

export const deleteAttendance = async (attendanceId) => {
  const res = await api.delete(`attendance/${attendanceId}/`);
  return res.data;
};

export const generateMonthlyAttendance = async (month, year) => {
  const res = await api.post("attendance/generate/", { month, year });
  return res.data;
};

// ---------- Export default ----------
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
  markEmergencyAttendance,
  deleteAttendance,
  generateMonthlyAttendance,
};

export default salaryService;
