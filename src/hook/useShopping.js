import { useDispatch, useSelector } from "react-redux";
import { addItem, updateItem, removeItem, setShoppingCart, updateQuantity } from "../redux/shoppingCart";
import { useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useTranslation } from "react-i18next";
const API_URL = import.meta.env.REACT_APP_API_URL;

const useShopping = () => {
  const dispatch = useDispatch();
  const shoppingCart = useSelector((state) => state.shopping);
  const { t } = useTranslation();
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (savedCart.length > 0) {
      dispatch(setShoppingCart(savedCart));
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
  }, [shoppingCart]);

  const handleAddItem = (item) => {
    dispatch(addItem(item));
  };

  const handleUpdateShoppingCart = (item) => {
    dispatch(updateItem(item));
  };

  const handleUpdateQuantity = async (id, Quantity) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const AccountID = user.id;
    const token = localStorage.getItem('token');
  
    try {
      const responseProduct = await axios.get(`${API_URL}/api/products/${id}`);
      if(Quantity > responseProduct.data.Quantity){
        message.error(`${t('exceed_invetory_quantity')}`)
        return;
      }
      const responseCart = await axios.put(`${API_URL}/api/cart`, {
        AccountID,
        ProductID: id,
        Quantity
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log('Cart updated successfully:', responseCart.data);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
    dispatch(updateQuantity({ ProductID: id, Quantity }));
  };  

  const handleRemoveItem = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'))
    const AccountID = user.id
    const token = localStorage.getItem('token')
    try {
      const response = await axios.delete(`${API_URL}/api/cart`, {
        data: {
          AccountID: AccountID,
          ProductID: id,
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });      
      console.log('Cart saved successfully:', response.data);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
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
