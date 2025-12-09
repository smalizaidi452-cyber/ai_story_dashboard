// ✅ src/services/projectApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/projects";

// 🔹 Get all projects
export const getProjects = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// 🔹 Create new project
export const createProject = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

// 🔹 Update existing project
export const updateProject = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};
