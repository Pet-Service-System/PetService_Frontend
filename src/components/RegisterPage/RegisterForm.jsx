import { Button, Form, Input, Typography, Row, Col, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [disableRegister, setDisableRegister] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!fullname) newErrors.fullname = 'Họ và tên là bắt buộc';
    if (!email) newErrors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
    if (!phoneNumber) newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
    else if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại phải có 10 chữ số';
    }
    if (!address) newErrors.address = 'Địa chỉ là bắt buộc';
    return newErrors;
  };

  useEffect(() => {
    let timer;
    if (disableRegister) {
      timer = setTimeout(() => {
        setDisableRegister(false);
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [disableRegister]);

  const handleSubmit = async () => {
    if (disableRegister) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true);
        const response = await axios.post('http://localhost:3001/api/auth/register', {
          fullname,
          password,
          email,
          phone: phoneNumber,
          address,
          status: 'active',
          role: 'Customer',
        });

        message.success('Đăng ký thành công', 2).then(() => {
          navigate('/login');
        });
        setDisableRegister(true);
        console.log('Đăng ký thành công', response.data);
      } catch (error) {
        if (error.response) {
          message.error(error.response.data.message);
        } else {
          message.error('Đã xảy ra lỗi');
        }
        setDisableRegister(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Row justify="center" style={{ minHeight: '100vh', alignItems: 'center' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8} className="px-10 py-10">
        <div className="p-6 md:p-12 bg-white rounded-lg shadow-md">
          <Title level={3} className="text-blue-500 text-center mb-4">Đăng ký</Title>
          <Form onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label="Họ và tên"
              name="fullname"
              validateStatus={errors.fullname && 'error'}
              help={errors.fullname}
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
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
              rules={[{ required: true, message: 'Email là bắt buộc' }]}
              validateStatus={errors.email && 'error'}
              help={errors.email}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label="Mật khẩu"
              name="password"
              validateStatus={errors.password && 'error'}
              help={errors.password}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
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
              rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
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
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
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
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                name="address"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full" disabled={isLoading || disableRegister}>
                {disableRegister ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </Form.Item>
          </Form>
          <div className="text-center mt-4">
            <Button type="link" onClick={() => navigate('/login')}>Quay lại đăng nhập</Button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default RegisterForm;
