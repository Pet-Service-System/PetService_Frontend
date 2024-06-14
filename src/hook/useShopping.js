import { useDispatch, useSelector } from "react-redux";
import { addItem, updateItem, removeItem, setShoppingCart, updateQuantity } from "../redux/shoppingCart";
import { useEffect } from "react";

const useShopping = () => {
  const dispatch = useDispatch();
  const shoppingCart = useSelector((state) => state.shopping);

  // Load shopping cart from localStorage on initial load
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (savedCart.length > 0) {
      dispatch(setShoppingCart(savedCart));
    }
  }, [dispatch]);

  // Save shopping cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
  }, [shoppingCart]);

  const handleAddItem = (item) => {
    dispatch(addItem(item));
  };

  const handleUpdateShoppingCart = (item) => {
    dispatch(updateItem(item));
  };

  const handleUpdateQuantity = (id, quantity) => {
    dispatch(updateQuantity({ ProductID: id, quantity }));
  };

  const handleRemoveItem = (id) => {
    dispatch(removeItem({ ProductID: id }));
  };

  return {
    shoppingCart,
    handleAddItem,
    handleUpdateShoppingCart,
    handleRemoveItem,
    handleUpdateQuantity,
  };
};

export default useShopping;


// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { addItem, updateItem, removeItem, setShoppingCart, updateQuantity } from '../redux/shoppingCart';
// import axios from 'axios';

// const useShopping = (AccountID) => {
//   const dispatch = useDispatch();
//   const shoppingCart = useSelector((state) => state.shopping);

//   // Load shopping cart from server on login or userID change
//   useEffect(() => {
//     const fetchShoppingCart = async () => {
//       try {
//         const response = await axios.get(`http://localhost:3001/api/shoppingCart/${AccountID}`);
//         dispatch(setShoppingCart(response.data));
//       } catch (error) {
//         console.error('Error fetching shopping cart:', error);
//       }
//     };

//     if (AccountID) {
//       fetchShoppingCart();
//     } else {
//       dispatch(setShoppingCart([])); // Reset shopping cart if no userID
//     }
//   }, [AccountID, dispatch]);

//   // Save shopping cart to server whenever it changes
//   useEffect(() => {
//     const saveShoppingCart = async () => {
//       try {
//         await axios.post(`http://localhost:3001/api/shoppingCart/${AccountID}`, shoppingCart);
//       } catch (error) {
//         console.error('Error saving shopping cart:', error);
//       }
//     };

//     if (AccountID) {
//       saveShoppingCart();
//     }
//   }, [AccountID, shoppingCart]);

//   const handleAddItem = (item) => {
//     dispatch(addItem(item));
//   };

//   const handleUpdateShoppingCart = (item) => {
//     dispatch(updateItem(item));
//   };

//   const handleUpdateQuantity = (id, quantity) => {
//     dispatch(updateQuantity({ ProductID: id, quantity }));
//   };

//   const handleRemoveItem = (id) => {
//     dispatch(removeItem({ ProductID: id }));
//   };

//   return {
//     shoppingCart,
//     handleAddItem,
//     handleUpdateShoppingCart,
//     handleRemoveItem,
//     handleUpdateQuantity,
//   };
// };

// export default useShopping;
