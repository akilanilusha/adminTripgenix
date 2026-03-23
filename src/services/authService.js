import axios from 'axios';

const API_BASE_URL = 'http://localhost:8086/api/auth';
const API_PROTECTED_URL = 'http://localhost:8086/api';
const API_STATUS_URL = 'http://localhost:8086/api'; 



export const register = (username, email, password) => {
    return axios.post(`${API_BASE_URL}/register`, { username, email, password });
};

export const login = (email, password) => {
    return axios.post(`${API_BASE_URL}/login`, { email, password });
};

export const forgotPasswordRequest = (email) => {
    return axios.post(`${API_BASE_URL}/password-reset-request`, { email });
};

export const resetPasswordConfirm = (token, newPassword) => {
    return axios.post(`${API_BASE_URL}/reset-password`, { token, newPassword });
};

export const updateProfile = (data) => axios.put(`${API_BASE_URL}/update`, data, {
  headers: { Authorization: `Bearer ${getToken()}` }
});
export const updatePassword = (data) => axios.put(`${API_BASE_URL}/password`, data, {
  headers: { Authorization: `Bearer ${getToken()}` }
});
export const deleteAccount = () => axios.delete(`${API_BASE_URL}/delete`, {
  headers: { Authorization: `Bearer ${getToken()}` }
});


/**
 * Checks the backend to see if any admin account has been registered.
 * @returns {Promise<boolean>} Resolves to true if an admin exists, false otherwise.
 */

export const checkAdminExists = async () => {
    try {
      
        const response = await axios.get(`${API_STATUS_URL}/admin/exists`);
        return response.data; 

    } catch (error) {

        console.error("Error checking admin existence status:", error);
        return true; 
    }
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const protectedApiCall = (method, url, data = {}) => {
    const token = getToken();
    if (!token) {
        throw new Error("No authentication token found.");
    }
    return axios({  //axios returns a Promise
        method: method,
        url: `${API_PROTECTED_URL}/${url}`, 
        data: data,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};