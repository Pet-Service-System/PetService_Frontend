import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // State để điều khiển trạng thái của nút Đổi mật khẩu
  const [disableChangePassword, setDisableChangePassword] = useState(false); // State để điều khiển việc vô hiệu hóa nút Đổi mật khẩu
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (disableChangePassword) {
      timer = setTimeout(() => {
        setDisableChangePassword(false);
      }, 1000); // Vô hiệu hóa trong 1 giây
    }

    return () => clearTimeout(timer);
  }, [disableChangePassword]);

  const validate = () => {
    const newErrors = {};
    if (!currentPassword.trim()) newErrors.currentPassword = 'Current password is required';
    if (!newPassword.trim()) newErrors.newPassword = 'New password is required';
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
    if (newPassword === currentPassword) newErrors.newPassword = 'New password must be different from current password';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async () => {
    if (disableChangePassword) return; // Nếu đang trong quá trình vô hiệu hóa, không thực hiện gì
    const token = localStorage.getItem('token'); // Get token from localStorage
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true); // Vô hiệu hóa nút Đổi mật khẩu
        // Gửi request để đổi mật khẩu
        const response = await axios.post('http://localhost:3001/change-password', {
          currentPassword: currentPassword,
          newPassword: newPassword,
        }, {
          headers: {
            Authorization: `Bearer ${token}` // Pass token in Authorization header
          }
        });
        console.log('Password changed successfully', response.data);
        // Hiển thị thông báo thành công và mở modal
        message.success('Đổi mật khẩu thành công!', 1).then(() => {
          navigate('/user-profile');
        });
        setDisableChangePassword(true); // Bắt đầu quá trình vô hiệu hóa nút Đổi mật khẩu
      } catch (error) {
        // Xử lý lỗi khi gặp lỗi trong quá trình đổi mật khẩu
        if (error.response) {
          message.error(error.response.data.message);
        } else {
          message.error('An error occurred');
        }
        setDisableChangePassword(true); // Bắt đầu quá trình vô hiệu hóa nút Đổi mật khẩu
      } finally {
        setIsLoading(false); // Enable lại nút Đổi mật khẩu
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleCancel = () => {
    // Xử lý hành động khi bấm nút "Cancel" ở đây
    // Ví dụ: chuyển hướng về trang trước đó
    navigate(-1);
  };

  return (
    <div className="max-w-3xl mx-auto p-12 bg-white rounded-lg py-20">
      <div className="max-w-4xl p-8 bg-white rounded-lg shadow-md">
        <Title level={2} className="text-center mb-6">
          Đổi mật khẩu
        </Title>
        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Mật khẩu hiện tại"
            validateStatus={errors.currentPassword ? 'error' : ''}
            help={errors.currentPassword}
            rules={[{ required: true, message: 'Current password is required' }]}
          >
            <Input.Password
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            validateStatus={errors.newPassword ? 'error' : ''}
            help={errors.newPassword}
            rules={[{ required: true, message: 'New password is required' }]}
          >
            <Input.Password
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            validateStatus={errors.confirmPassword ? 'error' : ''}
            help={errors.confirmPassword}
            rules={[{ required: true, message: 'Please confirm your new password' }]}
          >
            <Input.Password
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" htmlType="submit" className="mr-2" disabled={isLoading || disableChangePassword}>
                {disableChangePassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
              </Button>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
