import axios from "axios";

const axiosClientVehicles = axios.create({
  baseURL: "http://localhost:8085/vehicleController/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  
});


export default axiosClientVehicles;
