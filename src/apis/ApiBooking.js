import axios from "axios";

export const getBooking= async()=>{
    try {
      const response = await axios.get(`https://6652009d20f4f4c4427970fe.mockapi.io/bookings`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getBookingDetail= async(id)=>{
    try {
      const response = await axios.get(`https://6652009d20f4f4c4427970fe.mockapi.io/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };