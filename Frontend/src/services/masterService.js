import axios from "axios";

const API_URL = "http://localhost:5000/api/master";

export const fetchAllMasterData = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
