import axios from "axios";

const API = "http://localhost:5000/api/students";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getStudents = (params = {}) =>
  axios.get(API, {
    ...getAuthConfig(),
    params,
  });

export const createStudent = (data) =>
  axios.post(`${API}/create`, data, getAuthConfig());

export const updateStudent = (id, data) =>
  axios.put(`${API}/${id}`, data, getAuthConfig());

export const deleteStudent = (id) =>
  axios.delete(`${API}/${id}`, getAuthConfig());
