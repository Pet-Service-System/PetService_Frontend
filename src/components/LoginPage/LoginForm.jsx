/* eslint-disable no-irregular-whitespace */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, message, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import 'tailwindcss/tailwind.css';
const GOOGLE_CLIENT_ID = import.meta.env.REACT_APP_GOOGLE_CLIENT_ID

const { Title } = Typography;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [disableLogin, setDisableLogin] = useState(false);
  const navigate = useNavigate();
  const GoogleClientID = GOOGLE_CLIENT_ID;

  useEffect(() => {
    let timer;
    if (disableLogin) {
      timer = setTimeout(() => {
        setDisableLogin(false);
      }, 2000);
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
    if (disableLogin) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true);
        const response = await axios.post('http://localhost:3001/api/auth/login', {
          email,
          password,
        });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('user', JSON.stringify(user));

        message.success('Login successful!', 1).then(() => {
          navigate('/');
        });
        setDisableLogin(true);
      } catch (error) {
        if (error.response) {
          message.error(error.response.data.message);
        } else {
          message.error('An error occurred');
        }
        setDisableLogin(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleGoogleLoginSuccess = (response) => {
    const { credential } = response;
    fetch('http://localhost:3001/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: credential }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.user.role);
          localStorage.setItem('user', JSON.stringify(data.user));

          message.success('Login successful!', 1).then(() => {
            navigate('/');
          });
        } else {
          message.error('Google login failed: Invalid response from server');
        }
      })
      .catch((error) => {
        message.error('Google login failed');
        console.error('Google login error:', error);
      });
  };

  const handleGoogleLoginFailure = (error) => {
    message.error('Google login failed');
    console.error('Google login error:', error);
  };

  return (
    <GoogleOAuthProvider clientId={GoogleClientID}>
      <Row justify="center" style={{ alignItems: 'center' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={8} className='px-10 py-10'>
          <div className="p-6 md:p-12 bg-white rounded-lg shadow-md">
            <Title level={3} className="text-blue-500 text-center">Login</Title>
            <Form onFinish={handleSubmit} layout="vertical">
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
                  autoComplete="email"
                />
              </Form.Item>
              <Form.Item
                label="Password"
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
              <Form.Item className="w-full">
                <Button type="primary" htmlType="submit" className="w-full" disabled={isLoading || disableLogin}>
                  {disableLogin ? 'Logging in...' : 'Login'}
                </Button>
              </Form.Item>
              <div className="flex justify-between items-center w-full">
                <Button type="link" onClick={() => navigate('/register')} className="p-0">
                  Register
                </Button>
                <Button type="link" onClick={() => navigate('/forgot-password')} className="p-0">
                  Forgot Password?
                </Button>
              </div>
            </Form>
            <div className="mt-6 text-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
              />
            </div>
          </div>
        </Col>
      </Row>
    </GoogleOAuthProvider>
  );
};

export default LoginForm;
