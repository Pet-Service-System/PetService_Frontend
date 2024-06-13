import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // State để điều khiển trạng thái của nút Đăng nhập
  const [disableLogin, setDisableLogin] = useState(false); // State để điều khiển việc vô hiệu hóa nút Đăng nhập
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (disableLogin) {
      timer = setTimeout(() => {
        setDisableLogin(false);
      }, 1000); // Vô hiệu hóa trong 2 giây
    }

    return () => clearTimeout(timer);
  }, [disableLogin]);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async () => {
    if (disableLogin) return; // Nếu đang trong quá trình vô hiệu hóa, không thực hiện gì

    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true); // Vô hiệu hóa nút Đăng nhập
        const response = await axios.post('http://localhost:3001/api/auth/login', {
          email: email,
          password: password,
        });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Login successful', response.data.user);
  
        // Hiển thị thông báo thành công và chuyển trang sau 2 giây
        message.success('Bạn đã đăng nhập thành công!', 0.1).then(() => {
          navigate('/');
        });
        setDisableLogin(true); 
      } catch (error) {
        if (error.response) {
          message.error(error.response.data.message);
        } else {
          message.error('An error occurred');
        }
        setDisableLogin(true); // Bắt đầu quá trình vô hiệu hóa nút Đăng nhập
      } finally {
        setIsLoading(false); // Enable lại nút Đăng nhập
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
            <Button type="primary" htmlType="submit" className="w-full" disabled={isLoading || disableLogin}>
              {disableLogin  ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button> {/* Sử dụng disableLogin để vô hiệu hóa nút */}
          </Form.Item>
        </Form>
        <div className="mt-4 flex justify-between">
          <Button type="link" onClick={() => navigate('/register')}>Đăng kí</Button>
          <Button type="link" onClick={() => navigate('/forgot-password')}>Quên mật khẩu</Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
