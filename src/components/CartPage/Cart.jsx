import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Product 1', price: 100, quantity: 2 },
    { id: 2, name: 'Product 2', price: 200, quantity: 1 },
    { id: 3, name: 'Product 3', price: 150, quantity: 3 },
  ]);

  const handleCheckout = () => {
    navigate('/payment');
  };

  const handleCancel = () => {
    navigate('/');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="container mx-auto p-4 py-40 md:px-80">
      <h2 className="text-5xl text-red-500 text-center font-semibold mb-4">Giỏ hàng</h2>
      <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead>
          <tr>
            <th className="border px-4 py-2">Tên sản phẩm</th>
            <th className="border px-4 py-2">Giá</th>
            <th className="border px-4 py-2">Số lượng</th>
            <th className="border px-4 py-2">Tổng cộng</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2">${item.price}</td>
              <td className="border px-4 py-2">{item.quantity}</td>
              <td className="border px-4 py-2">${item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right mb-4">
        <h3 className="text-2xl text-green-700 font-semibold">Tổng cộng: ${calculateTotal()}</h3>
      </div>
      <div className="text-right">
        <button
          className="bg-orange-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={handleCheckout}
        >
          Thanh toán
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCancel}
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default Cart;
