import axios from "axios";

export const getPetInformation= async()=>{
    try {
      const response = await axios.get(`https://6652009d20f4f4c4427970fe.mockapi.io/pet-list`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };