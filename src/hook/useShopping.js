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
