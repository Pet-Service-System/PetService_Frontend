import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const shoppingSlice = createSlice({
  name: "shopping",
  initialState,
  reducers: {
    setShoppingCart: (state, action) => {
      return action.payload;
    },
    addItem: (state, action) => {
      const { ProductID, ProductName, Price, ImageURL, Quantity } = action.payload;
      const existingItem = state.find(item => item.ProductID === ProductID);
      if (existingItem) {
        existingItem.Quantity += Quantity;
      } else {
        state.push({
          ProductID,
          ImageURL,
          ProductName,
          Price,
          Quantity,
        });
      }
    },
    updateQuantity: (state, action) => {
      const { ProductID, Quantity } = action.payload;
      const existingItem = state.find(item => item.ProductID === ProductID);
      if (existingItem) {
        existingItem.Quantity = Quantity;
      }
    },
    updateItem: (state, action) => {
      const { ProductID, ProductName, Quantity } = action.payload;
      const existingItem = state.find(item => item.ProductID === ProductID);
      if (existingItem) {
        existingItem.ProductName = ProductName;
        existingItem.Quantity = Quantity;
      }
    },
    removeItem: (state, action) => {
      const { ProductID } = action.payload;
      return state.filter((item) => item.ProductID !== ProductID);
    },
  },
});

export const { setShoppingCart, addItem, updateItem, removeItem, updateQuantity } = shoppingSlice.actions;
export default shoppingSlice.reducer;