import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getPetInformation= async()=>{
    try {
      const response = await axios.get(`${API_URL}/pet-list`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };