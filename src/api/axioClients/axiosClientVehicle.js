import axios from "axios";

const axiosClientVehicles = axios.create({
  baseURL: "http://13.218.211.254:8085/vehicleController/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  
});


export default axiosClientVehicles;
