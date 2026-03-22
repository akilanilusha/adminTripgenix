import axios from "axios";

const axiosClientDrivers = axios.create({
  baseURL: "http://13.218.211.254:8081/driveController/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClientDrivers;
