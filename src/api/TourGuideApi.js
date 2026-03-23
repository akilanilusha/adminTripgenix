import axios from "axios";

const BASE_URL = "http://localhost:8089/api/v1";

const tourGuideApi = {
  getAllGuides() {
    return axios.get(`${BASE_URL}/getAll`);
  },

  createGuide(data) {
    return axios.post(`${BASE_URL}/create-tour-guide`, data);
  },

 updateGuide(data) {
    return axios.put(`${BASE_URL}/update-tour-guide`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    });
  },

  deleteGuide(id) {
    return axios.delete(`${BASE_URL}/delete/${id}`);
  },

  getGuideById(id) {
    return axios.get(`${BASE_URL}/search`, {
      params: { tourId: id }
    });
  }
};

export default tourGuideApi;
