import axios from "axios";

const API_URL = "/api/salary/role-salary-policies/";

// ✅ Fetch all salary policies
export const fetchRolePolicies = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// ✅ Create a new role salary policy
export const createRolePolicy = async (policy) => {
  const res = await axios.post(API_URL, policy);
  return res.data;
};

// ✅ Update an existing role salary policy (by role)
export const updateRolePolicy = async (role, policy) => {
  const res = await axios.put(`${API_URL}${role}/`, policy);
  return res.data;
};

// ✅ Delete a role salary policy
export const deleteRolePolicy = async (role) => {
  await axios.delete(`${API_URL}${role}/`);
};
