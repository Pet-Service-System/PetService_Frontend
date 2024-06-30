import axios from "axios";

export const getStaffs= async()=>{
    try {
      const response = await axios.get(`https://6652009d20f4f4c4427970fe.mockapi.io/Schedule`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };