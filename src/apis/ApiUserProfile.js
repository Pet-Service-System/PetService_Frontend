import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getUserInformation= async(id)=>{
    try {
      const response = await axios.get(`${API_URL}/user-profile/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };