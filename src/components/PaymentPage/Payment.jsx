import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Button, Form, Typography, Alert } from 'antd';

const { Title, Text } = Typography;

const Payment = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    address: '',
    phone: '',
    totalAmount: 0,
    cartItems: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setOrderDetails((prevOrderDetails) => ({
        ...prevOrderDetails,
        name: user.fullName,
        address: user.address,
        phone: user.phone,
      }));
    }

    // Tính tổng tiền từ giỏ hàng
    const shoppingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const totalAmount = shoppingCart.reduce((total, item) => {
      return total + item.Price * item.quantity;
    }, 0);

    // Cập nhật thông tin giỏ hàng để hiển thị
    setOrderDetails((prevOrderDetails) => ({
      ...prevOrderDetails,
      totalAmount: totalAmount,
      cartItems: shoppingCart,
    }));
  }, []);

  const handlePayment = (values) => {
    if (!selectedPaymentMethod) {
      Alert.error('Vui lòng chọn phương thức thanh toán.');
      return;
    }
    // Xử lý thanh toán và hiển thị thông tin đơn hàng
    Alert.success(`Đơn hàng đã được thanh toán thành công.`);
    // Sau khi thanh toán thành công, có thể xử lý lưu đơn hàng vào cơ sở dữ liệu MongoDB (sử dụng Mongoose).
  };

  const handleCancel = () => {
    navigate('/cart');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-10">
      <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md">
        <Title level={2} className="text-red-500 text-center mb-6">Phương thức thanh toán</Title>
        <Form onFinish={handlePayment}>
          <div className="mb-4">
            <div className="mb-2">
              <Text strong>Họ tên:</Text> {orderDetails.name}
            </div>
            <div className="mb-2">
              <Text strong>Địa chỉ:</Text> {orderDetails.address}
            </div>
            <div className="mb-2">
              <Text strong>Số điện thoại:</Text> {orderDetails.phone}
            </div>
            <div className="mb-2">
              <Text strong>Tổng tiền giỏ hàng:</Text> ${orderDetails.totalAmount.toFixed(2)}
            </div>
          </div>
          <div className="mb-4">
            <Title level={3} className="mb-2">Danh sách sản phẩm</Title>
            {orderDetails.cartItems.map((item, index) => (
              <div key={index} className="mb-2">
                <Text strong>{item.ProductName}</Text> - Số lượng: {item.quantity} - Đơn giá: ${item.Price.toFixed(2)}
              </div>
            ))}
          </div>
          <div className="mb-4">
            <Title level={3} className="mb-2">Chọn phương thức thanh toán</Title>
            <Radio.Group
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              <Radio value="vnpay" className="block mb-2">VNPay</Radio>
              <Radio value="cod" className="block mb-2">Thanh toán khi nhận hàng (COD)</Radio>
            </Radio.Group>
          </div>
          <div className="text-right">
            <Button
              type="primary"
              htmlType="submit"
              className="mr-2"
            >
              Thanh toán
            </Button>
            <Button
              type="default"
              onClick={handleCancel}
            >
              Hủy
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Payment;
