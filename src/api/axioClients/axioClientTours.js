import axios from "axios";

const axiosClientTours = axios.create({
  baseURL: "http://13.218.211.254:8087/bookingservice/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  
});

export default axiosClientTours;
