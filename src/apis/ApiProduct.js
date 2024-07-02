import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getForCatProducts= async()=>{
    try {
      const response = await axios.get(`${API_URL}/for-cat-product`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getForCatProductsDetail= async(id)=>{
    try {
      const response = await axios.get(`${API_URL}/for-cat-product/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getForDogProducts= async()=>{
    try {
      const response = await axios.get(`${API_URL}/for-dog-product`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getForDogProductsDetail= async(id)=>{
    try {
      const response = await axios.get(`${API_URL}/for-dog-product/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };