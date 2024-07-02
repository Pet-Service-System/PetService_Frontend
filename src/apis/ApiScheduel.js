import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getSchedule= async()=>{
    try {
      const response = await axios.get(`${API_URL}/schedule`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };