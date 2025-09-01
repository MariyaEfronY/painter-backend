import axios from "axios";

const userAPI = axios.create({
  baseURL: "http://localhost:5000/api/users",
});

// ✅ Automatically attach token
userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default userAPI;
