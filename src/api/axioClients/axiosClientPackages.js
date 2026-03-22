import axios from "axios";

const axiosClientPackages = axios.create({
  baseURL: "http://13.218.211.254:8084/api/packages",
  headers: {
    "Content-Type": "application/json",
  },
  
});

export default axiosClientPackages;
