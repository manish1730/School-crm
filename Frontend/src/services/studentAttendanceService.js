import axios from "axios";

const API = "http://localhost:5000/api/student-attendance";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getStudentAttendance = (params = {}) =>
  axios.get(API, {
    ...getAuthConfig(),
    params,
  });

export const saveStudentAttendance = (data) =>
  axios.post(`${API}/save`, data, getAuthConfig());
