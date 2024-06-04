import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Form, Input, message, Grid } from 'antd';
import {
  UserOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const UserProfile = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(localStorage.getItem('role') || 'guest');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();
  const screens = useBreakpoint();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    setFormData({ ...storedUser });
  }, []);

  const handleUpdateInfo = () => {
    setIsEditMode(true);
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setFormData({ ...user });
    setErrors({});
  };

  const handleSave = () => {
    let newErrors = {};

    // Validate inputs and update state
    if (!formData.fullname) newErrors.fullname = 'Họ và tên là bắt buộc';
    if (!formData.phone) newErrors.phone = 'Số điện thoại là bắt buộc';
    if (!formData.address) newErrors.address = 'Địa chỉ là bắt buộc';

    if (Object.keys(newErrors).length === 0) {
      // Update user info and localStorage
      localStorage.setItem('user', JSON.stringify(formData));
      setUser(formData);
      setIsEditMode(false);
      setErrors({});
      message.success('Thông tin đã được cập nhật');
    } else {
      setErrors(newErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('account_id');
    localStorage.removeItem('fullname');
    localStorage.removeItem('email'); 
    localStorage.removeItem('user'); 
    setRole('guest');
    setUser(null); 
    navigate('/');
    window.location.reload();
  };

  return (
    <Layout style={{ minHeight: '80vh' }}>
      {!screens.xs && (
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
            {role === 'customer' && (
              <>
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
              </>
            )}
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              Đăng xuất
            </Menu.Item>
          </Menu>
        </Sider>
      )}
      <Layout>
        <Content style={{ margin: '16px', padding: '24px', background: '#fff' }}>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Title level={2} className="text-center">
              Thông tin người dùng
            </Title>
            {isEditMode ? (
              <Form layout="vertical">
                <Form.Item label="Họ và tên" validateStatus={errors.fullname && "error"} help={errors.fullname}>
                  <Input
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                  />
                </Form.Item>
                <Form.Item label="Email">
                  <Input
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </Form.Item>
                <Form.Item label="Số điện thoại" validateStatus={errors.phone && "error"} help={errors.phone}>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Item>
                <Form.Item label="Địa chỉ" validateStatus={errors.address && "error"} help={errors.address}>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Form.Item>
                <div className="flex justify-between mt-6">
                  <Button type="primary" onClick={handleSave} className="mr-2">Lưu</Button>
                  <Button type="default" onClick={handleCancel}>Hủy</Button>
                </div>
              </Form>
            ) : (
              <>
                <Title level={5}>Họ và tên</Title>
                <p className="bg-gray-200 p-2 rounded-md">{user.fullname}</p>
                <Title level={5}>Email</Title>
                <p className="bg-gray-200 p-2 rounded-md">{user.email}</p>
                <Title level={5}>Số điện thoại</Title>
                <p className="bg-gray-200 p-2 rounded-md">{user.phone}</p>
                <Title level={5}>Địa chỉ</Title>
                <p className="bg-gray-200 p-2 rounded-md">{user.address}</p>
                <div className="flex justify-between mt-6">
                  <Button type="primary" onClick={handleUpdateInfo} className="mr-2">Cập nhật thông tin</Button>
                  <Button type="default" onClick={handleChangePassword}>Đổi mật khẩu</Button>
                </div>
              </>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserProfile;
