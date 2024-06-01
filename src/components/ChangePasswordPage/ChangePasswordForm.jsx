import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Layout, Menu } from 'antd';
import {
  UserOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Sider } = Layout;

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
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
      message.success('Password changed successfully');
      navigate('/user-profile');
    } else {
      setErrors(validationErrors);
    }
  };

  const handleCancel = () => {
    navigate('/user-profile');
  };

  return (
    <Layout style={{ minHeight: '80vh' }}>
      <Sider width={220}>
        <div className="logo" />
        <Menu theme="dark" mode="inline">
          <Menu.Item
            key="profile"
            icon={<UserOutlined />}
            onClick={() => navigate('/user-profile')}
          >
            Thông tin người dùng
          </Menu.Item>
          <Menu.Item
            key="pet-list"
            icon={<UnorderedListOutlined />}
            onClick={() => navigate('/pet-list')}
          >
            Danh sách thú cưng
          </Menu.Item>
          <Menu.Item
            key="transaction-history"
            icon={<HistoryOutlined />}
            onClick={() => navigate('/transaction-history')}
          >
            Lịch sử giao dịch
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => navigate('/')}>
            Đăng xuất
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <div className="flex items-center justify-center min-h-min py-8 bg-gray-100">
          <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-md">
            <Title level={2} className="text-center mb-6">
              Đổi mật khẩu
            </Title>
            <Form onSubmit={handleSubmit} layout="vertical">
              <Form.Item
                label="Mật khẩu hiện tại"
                validateStatus={errors.currentPassword ? 'error' : ''}
                help={errors.currentPassword}
              >
                <Input.Password
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item
                label="Mật khẩu mới"
                validateStatus={errors.newPassword ? 'error' : ''}
                help={errors.newPassword}
              >
                <Input.Password
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item
                label="Xác nhận mật khẩu mới"
                validateStatus={errors.confirmPassword ? 'error' : ''}
                help={errors.confirmPassword}
              >
                <Input.Password
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="mr-2">
                  Đổi mật khẩu
                </Button>
                <Button type="default" onClick={handleCancel}>
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Layout>
    </Layout>
  );
};

export default ChangePasswordForm;
