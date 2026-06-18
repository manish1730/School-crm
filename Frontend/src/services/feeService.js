import axios from "axios";

const API = "http://localhost:5000/api/fees";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const getBlobConfig = () => ({
  ...getAuthConfig(),
  responseType: "blob",
});

export const getFeeStructures = (params = {}) =>
  axios.get(`${API}/structures`, {
    ...getAuthConfig(),
    params,
  });

export const getFeeStructure = (id) =>
  axios.get(`${API}/structures/${id}`, getAuthConfig());

export const createFeeStructure = (data) =>
  axios.post(`${API}/structures`, data, getAuthConfig());

export const updateFeeStructure = (id, data) =>
  axios.put(`${API}/structures/${id}`, data, getAuthConfig());

export const deleteFeeStructure = (id) =>
  axios.delete(`${API}/structures/${id}`, getAuthConfig());

export const getFeeCollections = (params = {}) =>
  axios.get(`${API}/collections`, {
    ...getAuthConfig(),
    params,
  });

export const getStudentFeeSummary = (studentId, params = {}) =>
  axios.get(`${API}/students/${studentId}/summary`, {
    ...getAuthConfig(),
    params,
  });

export const recordFeePayment = (data) =>
  axios.post(`${API}/payments`, data, getAuthConfig());

export const getReceipt = (id) =>
  axios.get(`${API}/receipts/${id}`, getAuthConfig());

export const downloadReceipt = (id) =>
  axios.get(`${API}/receipts/${id}/download`, getBlobConfig());

export const exportFeeCollectionsPdf = (params = {}) =>
  axios.get(`${API}/collections/export/pdf`, {
    ...getBlobConfig(),
    params,
  });

export const exportFeeCollectionsExcel = (params = {}) =>
  axios.get(`${API}/collections/export/excel`, {
    ...getBlobConfig(),
    params,
  });

export const exportFeeStructuresPdf = (params = {}) =>
  axios.get(`${API}/structures/export/pdf`, {
    ...getBlobConfig(),
    params,
  });

export const exportFeeStructuresExcel = (params = {}) =>
  axios.get(`${API}/structures/export/excel`, {
    ...getBlobConfig(),
    params,
  });
