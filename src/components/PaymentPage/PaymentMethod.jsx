import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Button, Form, Typography, Alert } from 'antd';

const { Title, Text } = Typography;

const PaymentMethod = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const orderDetails = {
    orderId: '123456',
    name: 'Nguyen Van A',
    address: '123 Main St, City, Country',
    phone: '0123456789',
    totalAmount: 850,
  };

  const handlePayment = (values) => {
    if (!selectedPaymentMethod) {
      Alert.error('Please select a payment method.');
      return;
    }
    Alert.success(`Order ID: ${orderDetails.orderId}, Payment Method: ${selectedPaymentMethod}, Total Amount: ${orderDetails.totalAmount}`);
  };

  const handleCancel = () => {
    navigate('/cart');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-10">
      <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md">
        <Title level={2} className="text-red-500 text-center mb-6">Phương thức thanh toán</Title>
        <Form form={form} onFinish={handlePayment}>
          <div className="mb-4">
            <div className="mb-2">
              <Text strong>Mã đơn hàng:</Text> {orderDetails.orderId}
            </div>
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
              <Text strong>Tổng tiền giỏ hàng:</Text> ${orderDetails.totalAmount}
            </div>
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

export default PaymentMethod;
