import axios from "axios";

const axiosClientUsers = axios.create({
  baseURL: "http://localhost:8090/api/users",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClientUsers;
