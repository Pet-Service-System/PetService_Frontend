import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentMethod = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const navigate = useNavigate();

  const orderDetails = {
    orderId: '123456',
    name: 'Nguyen Van A',
    address: '123 Main St, City, Country',
    phone: '0123456789',
    totalAmount: 850,
  };

  const handlePaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const handlePayment = (event) => {
    event.preventDefault();
    if (!selectedPaymentMethod) {
      alert('Please select a payment method.');
      return;
    }
    alert(`Order ID: ${orderDetails.orderId}, Payment Method: ${selectedPaymentMethod}, Total Amount: ${orderDetails.totalAmount}`);
  };

  const handleCancel = () => {
    navigate('/cart');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-10">
      <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-4xl text-red-500 text-center font-semibold mb-6">Phương thức thanh toán</h2>
        <form onSubmit={handlePayment}>
          <div className="mb-4">
            <div className="mb-2">
              <strong>Mã đơn hàng:</strong> {orderDetails.orderId}
            </div>
            <div className="mb-2">
              <strong>Họ tên:</strong> {orderDetails.name}
            </div>
            <div className="mb-2">
              <strong>Địa chỉ:</strong> {orderDetails.address}
            </div>
            <div className="mb-2">
              <strong>Số điện thoại:</strong> {orderDetails.phone}
            </div>
            <div className="mb-2">
              <strong>Tổng tiền giỏ hàng:</strong> ${orderDetails.totalAmount}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-2xl font-semibold mb-2">Chọn phương thức thanh toán</h3>
            <div className="mb-2">
              <label className="flex items-center cursor-pointer mb-2 md:mb-2 md:mr-4">
                <input
                  type="radio"
                  value="vnpay"
                  checked={selectedPaymentMethod === 'vnpay'}
                  onChange={handlePaymentMethodChange}
                  className="hidden"
                />
                <span
                  className={`px-4 py-2 rounded-md ${selectedPaymentMethod === 'vnpay' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                >
                  VNPay
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="cod"
                  checked={selectedPaymentMethod === 'cod'}
                  onChange={handlePaymentMethodChange}
                  className="hidden"
                />
                <span
                  className={`px-4 py-2 rounded-md ${selectedPaymentMethod === 'cod' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                >
                  Thanh toán khi nhận hàng (COD)
                </span>
              </label>
            </div>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="bg-orange-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md mr-2"
            >
              Thanh toán
            </button>
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md"
              onClick={handleCancel}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethod;
