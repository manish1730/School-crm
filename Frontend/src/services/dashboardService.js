import axios from "axios";

const API = "http://localhost:5000/api/dashboard";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getCardsAnalytics = () => {
  return axios.get(`${API}/cards`, getAuthConfig());
};

export const getAttendanceTrend = () => {
  return axios.get(`${API}/attendance-trend`, getAuthConfig());
};

export const getEnquiryFunnel = () => {
  return axios.get(`${API}/enquiry-funnel`, getAuthConfig());
};

export const getCollectionTrend = () => {
  return axios.get(`${API}/collection-trend`, getAuthConfig());
};

export const getRecentActivities = () => {
  return axios.get(`${API}/recent-activities`, getAuthConfig());
};

export const getTodayBirthdays = () => {
  return axios.get(`${API}/birthdays`, getAuthConfig());
};
