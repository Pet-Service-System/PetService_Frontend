import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getTransactionHistory= async()=>{
    try {
      const response = await axios.get(`${API_URL}/transaction-history`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getTransactionDetail= async(id)=>{
    try {
      const response = await axios.get(`${API_URL}/transaction-history/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };