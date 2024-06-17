import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
// import { GoogleLogin } from 'react-google-login';

const { Title } = Typography;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // State to control the loading state of the login button
  const [disableLogin, setDisableLogin] = useState(false); // State to control disabling the login button
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (disableLogin) {
      timer = setTimeout(() => {
        setDisableLogin(false);
      }, 2000); // Disable for 2 seconds
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
    if (disableLogin) return; // Do nothing if in disable period

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

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const { tokenId } = response;
      const res = await axios.post('http://localhost:3001/api/auth/google', { tokenId });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('user', JSON.stringify(user));

      message.success('Google login successful!', 1).then(() => {
        navigate('/');
      });
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message);
      } else {
        message.error('An error occurred');
      }
    }
  };
const handleGoogleLoginFailure = (response) => {
    console.error('Google login failed', response);
    message.error('Google login failed');
  };

  return (
    <div className="max-w-3xl mx-auto p-12 bg-white rounded-lg py-20">
      <div className="max-w-4xl p-12 bg-white rounded-lg shadow-lg">
        <Title level={3} className="text-blue-500 text-center font-semibold mb-2">Login</Title>
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
            label="Password"
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
              {disableLogin ? 'Logging in...' : 'Login'}
            </Button>
          </Form.Item>
        </Form>
        <div className="mt-4 flex justify-between">
          <Button type="link" onClick={() => navigate('/register')}>Register</Button>
          <Button type="link" onClick={() => navigate('/forgot-password')}>Forgot Password</Button>
        </div>
        {/* <div className="mt-4 flex justify-center">
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Login with Google"
            onSuccess={handleGoogleLoginSuccess}
            onFailure={handleGoogleLoginFailure}
            cookiePolicy={'single_host_origin'}
          />
        </div> */}
      </div>
    </div>
  );
};

export default LoginForm;