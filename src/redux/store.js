import { configureStore } from "@reduxjs/toolkit";
import shoppingSlice from "../redux/shoppingCart"
export default configureStore({
    reducer:{
        shopping:shoppingSlice,
    }
})