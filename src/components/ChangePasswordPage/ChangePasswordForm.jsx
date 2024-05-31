import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const navigate = useNavigate()

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
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
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

  const handleCancel = () => {
    navigate('/user-profile')
  };

  return (
    <div className="flex items-center justify-center min-h-min py-8 bg-gray-100">
      <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Đổi mật khẩu</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="block mb-2">Mật khẩu hiện tại:</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
          </div>
          <div className="form-group">
            <label className="block mb-2">Mật khẩu mới:</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
          </div>
          <div className="form-group">
            <label className="block mb-2">Xác nhận mật khẩu mới:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
          <div className="flex justify-between mt-6">
            <button type="submit" className="w-1/2 bg-blue-500 text-white py-2 px-4 rounded-md mr-2 hover:bg-blue-600 transition duration-300">Đổi mật khẩu</button>
            <button type="button" onClick={handleCancel} className="w-1/2 bg-gray-500 text-white py-2 px-4 rounded-md ml-2 hover:bg-gray-600 transition duration-300">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
