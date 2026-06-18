import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getStaff = (params = {}) =>
  axios.get(`${API_BASE}/staff`, { ...getAuthConfig(), params });

export const createStaff = (data) =>
  axios.post(`${API_BASE}/staff/create`, data, getAuthConfig());

export const updateStaff = (id, data) =>
  axios.put(`${API_BASE}/staff/${id}`, data, getAuthConfig());

export const deleteStaff = (id) =>
  axios.delete(`${API_BASE}/staff/${id}`, getAuthConfig());

export const getStaffAttendance = (params = {}) =>
  axios.get(`${API_BASE}/staff-attendance`, { ...getAuthConfig(), params });

export const markStaffAttendance = (data) =>
  axios.post(`${API_BASE}/staff-attendance/mark`, data, getAuthConfig());

export const getLeaveRequests = () =>
  axios.get(`${API_BASE}/leaves`, getAuthConfig());

export const createLeaveRequest = (data) =>
  axios.post(`${API_BASE}/leaves/create`, data, getAuthConfig());

export const updateLeaveStatus = (id, status) =>
  axios.patch(`${API_BASE}/leaves/${id}/status`, { status }, getAuthConfig());

export const getPayroll = () =>
  axios.get(`${API_BASE}/payroll`, getAuthConfig());

export const generatePayroll = (data) =>
  axios.post(`${API_BASE}/payroll/generate`, data, getAuthConfig());
