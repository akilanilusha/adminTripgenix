import axios from "axios";

const axiosClientPackages = axios.create({
  baseURL: "http://localhost:8084/api/packages",
  headers: {
    "Content-Type": "application/json",
  },
  
});

export default axiosClientPackages;
