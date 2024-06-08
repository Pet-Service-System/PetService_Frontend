import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const shoppingSlice = createSlice({
    name: "shopping",
    initialState,
    reducers: {
        setShoppingCart: (state, action) => {
            return action.payload;
        },
        addItem(state, action) {
            const { ProductID, ProductName, Price, ImageURL, quantity } = action.payload;
            const existingItem = state.find(item => item.ProductID === ProductID);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.push({
                    ProductID: ProductID,
                    ImageURL: ImageURL,
                    ProductName: ProductName,
                    Price: Price,
                    quantity: quantity,
                });
            }
        },
        updateQuantity(state, action) {
            const { ProductID, quantity } = action.payload;
            const existingItem = state.find(item => item.ProductID === ProductID);
            if (existingItem) {
                existingItem.quantity = quantity;
            }
        },
        updateItem(state, action) {
            const { ProductID, ProductName, quantity } = action.payload;
            const existingItem = state.find(item => item.ProductID === ProductID);
            if (existingItem) {
                existingItem.ProductName = ProductName;
                existingItem.quantity = quantity;
            }
        },
        removeItem(state, action) {
            const { ProductID } = action.payload;
            return state.filter((item) => item.ProductID !== ProductID);
        },
        updateQuantityAndPrice(state, action) {
            const { ProductID, newQuantity } = action.payload;
            const productToUpdate = state.find((product) => product.ProductID === ProductID);

            if (productToUpdate) {
                productToUpdate.quantity = newQuantity;
                productToUpdate.totalPrice = productToUpdate.Price * newQuantity;
            }
        },
    },
});

export const { setShoppingCart, addItem, updateItem, removeItem, updateQuantityAndPrice, updateQuantity } = shoppingSlice.actions;
export default shoppingSlice.reducer;
