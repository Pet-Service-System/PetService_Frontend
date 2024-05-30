import axios from "axios";

export const getUserInformation= async(id)=>{
    try {
      const response = await axios.get(`https://6652009d20f4f4c4427970fe.mockapi.io/user-profile/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };