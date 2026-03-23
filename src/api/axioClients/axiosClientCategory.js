import axios from "axios";

const axiosClientVehiclesCategories = axios.create({
  baseURL: "http://localhost:8085/categoryController/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  
});


export default axiosClientVehiclesCategories;
