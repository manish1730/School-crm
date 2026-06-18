import axios from "axios";

const API = "http://localhost:5000/api/school-profile";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getSchoolProfile = () => {
  return axios.get(API, getAuthConfig());
};

export const createSchoolProfile = (data) => {
  return axios.post(API, data, getAuthConfig());
};

export const updateSchoolProfile = (id, data) => {
  return axios.put(`${API}/${id}`, data, getAuthConfig());
};

export const deleteSchoolProfile = (id) => {
  return axios.delete(`${API}/${id}`, getAuthConfig());
};

export const uploadSchoolImage = (file, type) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", type);

  return axios.post(`${API}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
