
import axios from "axios";
import { getEnvironmentConfig } from "../utils";

const API_URL = getEnvironmentConfig().apiUrl;

export interface ProfileUpdatePayload {
  [key: string]: string;
}

export const ApiService = {
  updateProfile: async (endpoint: string, payload: ProfileUpdatePayload) => {
    try {
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update profile");
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }
};

export default ApiService;
