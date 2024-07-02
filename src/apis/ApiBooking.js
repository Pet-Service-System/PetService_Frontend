import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getBooking= async()=>{
    try {
      const response = await axios.get(`${API_URL}/bookings`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getBookingDetail= async(id)=>{
    try {
      const response = await axios.get(`${API_URL}/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };