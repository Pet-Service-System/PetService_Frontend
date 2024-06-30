import axios from "axios";

export const getTransactionHistory= async()=>{
    try {
      const response = await axios.get(`https://6652009d20f4f4c4427970fe.mockapi.io/transaction-history`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const getTransactionDetail= async(id)=>{
    try {
      const response = await axios.get(`https://6652009d20f4f4c4427970fe.mockapi.io/transaction-history/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };