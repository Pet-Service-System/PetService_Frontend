import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getPetService= async()=>{
    try {
      const response = await axios.get(`${API_URL}/pet-service`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getPetServiceDetail= async(id)=>{
    try {
      const response = await axios.get(`${API_URL}/pet-service/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getHotelService= async()=>{
    try {
      const response = await axios.get(`${API_URL}/for-dog-product`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getHotelServiceDetail= async(id)=>{
    try {
      const response = await axios.get(`${API_URL}/for-dog-product/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getHotels = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/hotels`);
        return response.data;
    } catch (error) {
        console.error('Error fetching hotels:', error);
        throw error; // Optionally handle or rethrow the error
    }
};

export const getHotelById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/api/hotels/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching hotel with ID ${id}:`, error);
        throw error; // Optionally handle or rethrow the error
    }
};