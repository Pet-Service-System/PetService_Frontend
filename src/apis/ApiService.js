import axios from "axios";

export const getPetService= async()=>{
    try {
      const response = await axios.get(`https://6652009d20f4f4c4427970fe.mockapi.io/pet-service`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getPetServiceDetail= async(id)=>{
    try {
      const response = await axios.get(`https://6652009d20f4f4c4427970fe.mockapi.io/pet-service/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getHotelService= async()=>{
    try {
      const response = await axios.get(`https://66500bc8ec9b4a4a60307f5f.mockapi.io/for-dog-product`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getHotelServiceDetail= async(id)=>{
    try {
      const response = await axios.get(`https://66500bc8ec9b4a4a60307f5f.mockapi.io/for-dog-product/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };