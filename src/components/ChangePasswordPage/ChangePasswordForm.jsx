import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Modal } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const navigate = useNavigate();

  const accountId = localStorage.getItem('account_id'); // Lấy account_id từ localStorage

  const validate = () => {
    const newErrors = {};
    if (!currentPassword.trim()) newErrors.currentPassword = 'Current password is required';
    if (!newPassword.trim()) newErrors.newPassword = 'New password is required';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token'); // Get token from localStorage

    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:3001/change-password', {
          currentPassword: currentPassword,
          newPassword: newPassword,
        }, {
          headers: {
            Authorization: `Bearer ${token}` // Pass token in Authorization header
          }
        });
        console.log('Password changed successfully', response.data);
        message.success('Password changed successfully');
        setTimeout(() => {
          navigate('/user-profile');
        }, 2000);
      } catch (error) {
        if (error.response) {
          message.error(error.response.data.message);
        } else {
          message.error('An error occurred');
        }
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
              <Button type="primary" htmlType="submit" className="mr-2">
                Đổi mật khẩu
              </Button>
              <Button type="default" onClick={handleCancel}>
                Hủy bỏ
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
      <Modal
        visible={successModalVisible}
        onCancel={() => setSuccessModalVisible(false)}
        footer={null}
        centered
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <CheckCircleOutlined style={{ fontSize: '170px', color: '#52c41a' }} />
          <p className="mt-4">Password changed successfully!</p>
        </div>
      </Modal>
    </div>
  );
};

export default ChangePasswordForm;
