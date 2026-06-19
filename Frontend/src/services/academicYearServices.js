import axios from "axios";

const API =
  "http://localhost:5000/api/academic-year";

const getAuthConfig = () => {

  const token =
    localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

};

export const getAcademicYears = () =>
  axios.get(
    API,
    getAuthConfig()
  );

export const createAcademicYear = (data) =>
  axios.post(
    `${API}/create`,
    data,
    getAuthConfig()
  );

export const updateAcademicYear = (
  id,
  data
) =>
  axios.put(
    `${API}/${id}`,
    data,
    getAuthConfig()
  );

export const deleteAcademicYear = (id) =>
  axios.delete(
    `${API}/${id}`,
    getAuthConfig()
  );

export const setCurrentAcademicYear = (id) =>
  axios.put(
    `${API}/set-current/${id}`,
    {},
    getAuthConfig()
  );