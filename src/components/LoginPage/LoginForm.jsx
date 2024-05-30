import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState(''); // To store login messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:3001/login', {
          username: formData.email,
          password: formData.password,
        });
        setLoginMessage(response.data.message);
        console.log('Login successful', response.data.user);
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

  return (
    <div className="max-w-3xl mx-auto p-12 bg-white rounded-lg py-40">
      {isSignUp ? (
        <SignUp setIsSignUp={setIsSignUp} />
      ) : isForgotPassword ? (
        <ForgotPassword setIsForgotPassword={setIsForgotPassword} />
      ) : (
        <div className="max-w-4xl p-12 bg-white rounded-lg shadow-lg">
          <h2 className="text-4xl text-blue-500 font-semibold mb-6 text-center">ĐĂNG NHẬP</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-1">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block mb-1">Mật khẩu:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.password && <p className="text-red-500 mt-1">{errors.password}</p>}
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md">Đăng nhập</button>
          </form>
          {loginMessage && <p className="text-center mt-4 text-red-500">{loginMessage}</p>}
          <div className="mt-4 flex justify-between">
            <button className="text-blue-500" onClick={() => setIsSignUp(true)}>Đăng kí</button>
            <button className="text-blue-500" onClick={() => setIsForgotPassword(true)}>Quên mật khẩu</button>
          </div>
        </div>
      )}
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
      // You can add your signup logic here
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white rounded-lg shadow-md">
      <h2 className="text-4xl text-blue-500 font-semibold mb-6 text-center">Đăng kí</h2>
      <form onSubmit={handleSubmit} className="signupForm">
        <div className="mb-4">
          <div className="flex">
            <div className="w-1/2 pr-2">
              <label htmlFor="firstName" className="block mb-1">Tên:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.firstName && <p className="text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div className="w-1/2 pl-2">
              <label htmlFor="lastName" className="block mb-1">Họ:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.lastName && <p className="text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1">Mật khẩu:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.password && <p className="text-red-500 mt-1">{errors.password}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block mb-1">Xác nhận mật khẩu:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.confirmPassword && <p className="text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block mb-1">Số điện thoại:</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.phoneNumber && <p className="text-red-500 mt-1">{errors.phoneNumber}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="address" className="block mb-1">Địa chỉ:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.address && <p className="text-red-500 mt-1">{errors.address}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md">Đăng kí</button>
      </form>
      <button className="mt-4 text-blue-500" onClick={() => setIsSignUp(false)}>Quay lại đăng nhập</button>
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
      // You can add your reset password logic here
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white rounded-lg shadow-md">
      <h2 className="text-4xl text-blue-500 font-semibold mb-6 text-center">Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md">Gửi yêu cầu</button>
      </form>
      <button className="mt-4 text-blue-500" onClick={() => setIsForgotPassword(false)}>Quay lại đăng nhập</button>
    </div>
  );
};

export default LoginForm;
