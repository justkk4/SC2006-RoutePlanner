import axios from "axios";
console.log(process.env.EXPO_PUBLIC_BACKEND_URL);
const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL, // Backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
