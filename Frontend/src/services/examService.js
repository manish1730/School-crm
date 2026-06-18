import axios from "axios";

const API = "http://localhost:5000/api/exams";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getMarksEntryStudents = (params = {}) =>
  axios.get(`${API}/marks-entry`, {
    ...getAuthConfig(),
    params,
  });

export const saveMarks = (data) =>
  axios.post(`${API}/marks-entry/save`, data, getAuthConfig());

export const getExamResults = (params = {}) =>
  axios.get(`${API}/results`, {
    ...getAuthConfig(),
    params,
  });
