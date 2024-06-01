import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, Modal, Row, Col } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Navigate, useNavigate } from 'react-router-dom';

const { Title } = Typography;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false); // State để kiểm soát việc hiển thị Modal
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:3001/login', {
          email: email,
          password: password,
        });
        console.log('Login successful', response.data.user);
        setSuccessModalVisible(true); // Hiển thị Modal khi đăng nhập thành công
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigate('/home'); // Chuyển hướng đến trang home
        }, 2000);
      } catch (error) {
        if (error.response) {
          setLoginMessage(error.response.data.message);
        } else {
          setLoginMessage('An error occurred');
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  return (
    <div className="max-w-3xl mx-auto p-12 bg-white rounded-lg py-20">
      {isSignUp ? (
        <SignUp setIsSignUp={setIsSignUp} />
      ) : isForgotPassword ? (
        <ForgotPassword setIsForgotPassword={setIsForgotPassword} />
      ) : (
        <div className="max-w-4xl p-12 bg-white rounded-lg shadow-lg">
          <Title level={2} className="text-blue-500 text-center font-semibold mb-2">ĐĂNG NHẬP</Title>
          <Form onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Email is required' }]}
            >
              <Input
                type="email"
                value={email}
                onChange={handleEmailChange}
              />
            </Form.Item>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Password is required' }]}
            >
              <Input.Password
                value={password}
                onChange={handlePasswordChange} // Cập nhật giá trị password khi người dùng thay đổi
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">Đăng nhập</Button>
            </Form.Item>
          </Form>
          {loginMessage && <p className="text-center mt-4 text-red-500">{loginMessage}</p>}
          <div className="mt-4 flex justify-between">
            <Button type="link" onClick={() => setIsSignUp(true)}>Đăng kí</Button>
            <Button type="link" onClick={() => setIsForgotPassword(true)}>Quên mật khẩu</Button>
          </div>
        </div>
      )}
     <Modal
        visible={successModalVisible}
        onCancel={() => setSuccessModalVisible(false)}
        footer={[
        ]}
        centered
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <CheckCircleOutlined style={{ fontSize: '170px', color: '#52c41a' }} />
          <p className="mt-4">Bạn đã đăng nhập thành công!</p>
        </div>
      </Modal>

    </div>
  );
};


const SignUp = ({ setIsSignUp }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      console.log('Form submitted', formData);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white rounded-lg shadow-md">
      <Title level={2} className="text-blue-500 text-center font-semibold mb-6">Đăng kí</Title>
      <Form onFinish={handleSubmit} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên"
              name="firstName"
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input
                value={formData.firstName}
                onChange={handleChange}
                name="firstName"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Họ"
              name="lastName"
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input
                value={formData.lastName}
                onChange={handleChange}
                name="lastName"
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Email is required' }]}
        >
          <Input
            type="email"
            value={formData.email}
            onChange={handleChange}
            name="email"
          />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Password is required' }]}
        >
          <Input.Password
            value={formData.password}
            onChange={handleChange}
            name="password"
          />
        </Form.Item>
        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          rules={[{ required: true, message: 'Confirm Password is required' }]}
        >
          <Input.Password
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
          />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[{ required: true, message: 'Phone number is required' }]}
        >
          <Input
            value={formData.phoneNumber}
            onChange={handleChange}
            name="phoneNumber"
          />
        </Form.Item>
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: 'Address is required' }]}
        >
          <Input
            value={formData.address}
            onChange={handleChange}
            name="address"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">Đăng kí</Button>
        </Form.Item>
      </Form>
      <Button type="link" className="mt-4" onClick={() => setIsSignUp(false)}>Quay lại đăng nhập</Button>
    </div>
  );
};

const ForgotPassword = ({ setIsForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      console.log('Reset password for', email);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white rounded-lg shadow-md">
      <Title level={2} className="text-blue-500 text-center font-semibold mb-6">Quên mật khẩu</Title>
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Email is required' }]}
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">Gửi yêu cầu</Button>
        </Form.Item>
      </Form>
      <Button type="link" className="mt-4" onClick={() => setIsForgotPassword(false)}>Quay lại đăng nhập</Button>
    </div>
  );
};

export default LoginForm;
