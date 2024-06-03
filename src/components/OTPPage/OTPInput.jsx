import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const OTPInput = () => {
  const [otp, setOTP] = useState('');
  const navigate = useNavigate();

  const handleOTPChange = (e) => {
    setOTP(e.target.value);
  };

  const handleSubmit = () => {
    // Xử lý việc gửi OTP ở đây
    message.success(`Mã OTP đã nhập: ${otp}`);
  };

  const handleResendOTP = () => {
    // Xử lý việc gửi lại OTP ở đây
    message.info('Đang gửi lại mã OTP...');
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-3xl w-full p-8 border rounded-lg shadow-md relative">
        <Title level={2} className="text-center mb-6">Xác nhận OTP</Title>
        <Text className="block text-2xl mb-4 text-center">Chúng tôi đã gửi mã OTP đến email của bạn.</Text>
        <Form onFinish={handleSubmit}>
          <Form.Item
            name="otp"
            rules={[{ required: true, message: 'Vui lòng nhập mã OTP' }]}
          >
            <Input
              placeholder="Nhập mã OTP"
              maxLength={4}
              value={otp}
              onChange={handleOTPChange}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Xác nhận OTP
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center">
          <Text className="text-lg">Chưa nhận được mã OTP?</Text>
          <Button type="link" onClick={handleResendOTP}>Gửi lại OTP</Button>
        </div>
        <div className="absolute top-0 left-0 mt-4 ml-4">
          <Button type="link" onClick={() => navigate(-1)}>
            <ArrowLeftOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPInput;
