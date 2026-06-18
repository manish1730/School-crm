import axios from "axios";

const API = "http://localhost:5000/api/enquiries";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getEnquiries = (params = {}) =>
  axios.get(API, {
    ...getAuthConfig(),
    params,
  });

export const getEnquiryStats = () =>
  axios.get(`${API}/stats`, getAuthConfig());

export const createEnquiry = (data) =>
  axios.post(`${API}/create`, data, getAuthConfig());

export const updateEnquiry = (id, data) =>
  axios.put(`${API}/${id}`, data, getAuthConfig());

export const convertEnquiry = (id) =>
  axios.patch(`${API}/${id}/convert`, {}, getAuthConfig());

export const deleteEnquiry = (id) =>
  axios.delete(`${API}/${id}`, getAuthConfig());
