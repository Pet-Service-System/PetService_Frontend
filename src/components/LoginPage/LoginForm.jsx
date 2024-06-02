import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, Modal } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loginMessage, setLoginMessage] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const navigate = useNavigate();

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
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('account_id', user.account_id); // Lưu account_id vào localStorage
        console.log('Role saved to localStorage:', localStorage.getItem('role'));
        console.log('Account ID saved to localStorage:', localStorage.getItem('account_id'));
        console.log('Login successful', response.data.user);
        setLoginMessage('');
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigate('/');
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
      <div className="max-w-4xl p-12 bg-white rounded-lg shadow-lg">
        <Title level={3} className="text-blue-500 text-center font-semibold mb-2">ĐĂNG NHẬP</Title>
        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Email is required' }]}
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email}
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
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password}
          >
            <Input.Password
              value={password}
              onChange={handlePasswordChange}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">Đăng nhập</Button>
          </Form.Item>
        </Form>
        {loginMessage && <p className="text-center mt-4 text-red-500">{loginMessage}</p>}
        <div className="mt-4 flex justify-between">
          <Button type="link" onClick={() => navigate('/register')}>Đăng kí</Button>
          <Button type="link" onClick={() => navigate('/forgot-password')}>Quên mật khẩu</Button>
        </div>
      </div>
      <Modal
        visible={successModalVisible}
        onCancel={() => setSuccessModalVisible(false)}
        footer={null}
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

export default LoginForm;
