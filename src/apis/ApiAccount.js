import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getAccounts= async()=>{
    try {
      const response = await axios.get(`${API_URL}/accounts`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };