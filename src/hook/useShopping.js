import { useDispatch, useSelector } from "react-redux";
import {
  addItem,
  updateItem,
  removeItem,
  setShoppingCart,
  updateQuantity,
} from "../redux/shoppingCart";

const useShopping = () => {
  const dispatch = useDispatch();
  const shoppingCart = useSelector((state) => state.shopping);

  const handleAddItem = (item) => {
    dispatch(addItem(item));
  };

  const handleUpdateShoppingCart = (item) => {
    dispatch(updateItem( item ));
  };

  const handelUpdateQuantity = (id, quantity) =>{
    console.log(id, quantity)
    dispatch(updateQuantity({id,quantity}));
  } 

  const handleRemoveItem = (id) => {
    dispatch(removeItem({id}));
  };

  const handleSetShoppingCart = (cart) => {
    dispatch(setShoppingCart(cart));
  };

//   const handleUpdateDay = (day) => {
//     dispatch(updateDay({ day }));
//   };

  return {
    shoppingCart,
    handleAddItem,
    handleUpdateShoppingCart,
    handleRemoveItem,
    handleSetShoppingCart,
    handelUpdateQuantity,
  };
};

export default useShopping;