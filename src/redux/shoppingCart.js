import { createSlice } from "@reduxjs/toolkit";


const initialState = [];

const shoppingSlice = createSlice({
    name: "shopping",
    initialState,
    reducers:
    {
        setShoppingCart: (state, action) => {
            return action.payload;
        },
        addItem(state, action) {
            const { id, name, price, image, quantity } = action.payload;
            console.log(quantity)
            const existingItem = state.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += quantity; // Tăng số lượng nếu sản phẩm đã có trong giỏ hàng
            } else {
                state.push({
                    id: id,
                    image: image,
                    name: name,
                    price: price,
                    quantity: quantity,
                });
            }
        },
        updateQuantity(state,action){
            const { id, quantity } = action.payload;
            console.log(id, quantity)
            const existingItemIndex = state.findIndex((item) => item.id === id);
            if (existingItemIndex !== -1) {
                state[existingItemIndex] = {
                    ...state[existingItemIndex],
                    quantity: quantity,
                };
            }
        },
        updateItem(state, action) {
            const { id, name, quantity } = action.payload;
            const existingItemIndex = state.findIndex((item) => item.id === id);
        
            if (existingItemIndex !== -1) {
                state[existingItemIndex] = {
                    ...state[existingItemIndex],
                    name: name,
                    quantity: quantity,
                };
            }
        },
        
        removeItem(state, action) {
            const { id } = action.payload;
            console.log(id);
            return state.filter((item) => item.id !== id);
        },
        updateQuantityAndPrice(state, action) {
            const { id, newQuantity } = action.payload;
            const productToUpdate = state.find((product) => product.id === id);

            if (productToUpdate) {
                productToUpdate.quantity = newQuantity;
                productToUpdate.totalPrice = productToUpdate.price * newQuantity;
            }
        },
    },
});

export const {setShoppingCart,addItem,updateItem,removeItem,updateQuantityAndPrice,updateQuantity }=shoppingSlice.actions;
export default shoppingSlice.reducer;