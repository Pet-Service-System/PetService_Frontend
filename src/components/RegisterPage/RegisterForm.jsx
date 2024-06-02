import { Button, Form, Input, Typography, Row, Col } from 'antd';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const RegisterForm = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [registrationMessage, setRegistrationMessage] = useState('');
  const navigate = useNavigate();

  // Function to generate accountID
  const generateAccountID = () => {
    // Here you can generate the accountID based on your requirements
    // For example, you can use timestamp combined with a random string
    return `A${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  };

  const validate = () => {
    const newErrors = {};
    if (!fullname) newErrors.fullname = 'Fullname is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!address) newErrors.address = 'Address is required';
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const accountID = generateAccountID(); // Generate accountID
        const response = await axios.post('http://localhost:3001/register', {
          accountID: accountID,
          fullname: fullname,
          password: password,
          email: email,
          phone: phoneNumber,
          address: address,
          status: 'active', // Assuming default status is 'active'
          role: 'customer', // Assuming default role is 'customer'
        });
        setRegistrationMessage('Registration successful');
        console.log('Registration successful', response.data);
      } catch (error) {
        if (error.response) {
          setRegistrationMessage(error.response.data.message);
        } else {
          setRegistrationMessage('An error occurred');
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Row justify="center" style={{ minHeight: '100vh', alignItems: 'center' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8} className='px-10 py-10'>
        <div className="p-6 md:p-12 bg-white rounded-lg shadow-md">
          <Title level={3} className="text-blue-500 text-center mb-4">Đăng kí</Title>
          <Form onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label="Họ và tên"
              name="fullname"
              validateStatus={errors.fullname && 'error'}
              help={errors.fullname}
            >
              <Input
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                name="fullname"
              />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              validateStatus={errors.email && 'error'}
              help={errors.email}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
              />
            </Form.Item>
            <Form.Item
              label="Mật khẩu"
              name="password"
              validateStatus={errors.password && 'error'}
              help={errors.password}
            >
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
              />
            </Form.Item>
            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              validateStatus={errors.confirmPassword && 'error'}
              help={errors.confirmPassword}
            >
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                name="confirmPassword"
              />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              validateStatus={errors.phoneNumber && 'error'}
              help={errors.phoneNumber}
            >
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                name="phoneNumber"
              />
            </Form.Item>
            <Form.Item
              label="Địa chỉ"
              name="address"
              validateStatus={errors.address && 'error'}
              help={errors.address}
            >
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                name="address"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">Đăng kí</Button>
            </Form.Item>
          </Form>
          {registrationMessage && <p className="text-center mt-4">{registrationMessage}</p>}
          <div className="text-center mt-4">
            <Button type="link" onClick={() => navigate('/login')}>Quay lại đăng nhập</Button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default RegisterForm;
