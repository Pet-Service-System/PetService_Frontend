import axios from "axios";

export const getForCatProducts= async()=>{
    try {
      const response = await axios.get(`https://66500bc8ec9b4a4a60307f5f.mockapi.io/for-cat-product`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getForCatProductsDetail= async(id)=>{
    try {
      const response = await axios.get(`https://66500bc8ec9b4a4a60307f5f.mockapi.io/for-cat-product/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getForDogProducts= async()=>{
    try {
      const response = await axios.get(`https://66500bc8ec9b4a4a60307f5f.mockapi.io/for-dog-product`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getForDogProductsDetail= async(id)=>{
    try {
      const response = await axios.get(`https://66500bc8ec9b4a4a60307f5f.mockapi.io/for-dog-product/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };