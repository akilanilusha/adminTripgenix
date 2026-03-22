import axios from "axios";

const axiosClientUsers = axios.create({
  baseURL: "http://13.218.211.254:8090/api/users",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClientUsers;
