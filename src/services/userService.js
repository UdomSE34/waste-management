// src/services/userService.js
import axios from 'axios';

const API_BASE_URL = '/api/users/';

export const getUsers = async (params = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};