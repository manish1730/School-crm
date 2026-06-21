import axios from "axios";

const API_URL = "http://localhost:5000/api/search";

export const globalSearch = async (query) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}`, {
    params: { q: query },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
