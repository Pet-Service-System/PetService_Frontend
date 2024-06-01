import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Form, Input, Row, Col, message } from 'antd';
import {
  UserOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Sider, Content } = Layout;

const UserProfile = () => {
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '123-456-7890',
    address: '123 Main St, Anytown, USA',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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

    if (!formData.firstName.trim()) newErrors.firstName = 'Tên không được để trống';
    if (!formData.lastName.trim()) newErrors.lastName = 'Họ không được để trống';
    if (!formData.email.trim()) newErrors.email = 'Email không được để trống';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Số điện thoại không được để trống';
    if (!formData.address.trim()) newErrors.address = 'Địa chỉ không được để trống';

    if (Object.keys(newErrors).length === 0) {
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
        <Content style={{ margin: '16px', padding: '24px', background: '#fff' }}>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Title level={2} className="text-center">
              Thông tin người dùng
            </Title>
            {isEditMode ? (
              <Form layout="vertical">
                <Form.Item label="Tên" validateStatus={errors.firstName ? 'error' : ''} help={errors.firstName}>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Form.Item>
                <Form.Item label="Họ" validateStatus={errors.lastName ? 'error' : ''} help={errors.lastName}>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Form.Item>
                <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email}>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Item>
                <Form.Item label="Số điện thoại" validateStatus={errors.phoneNumber ? 'error' : ''} help={errors.phoneNumber}>
                  <Input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </Form.Item>
                <Form.Item label="Địa chỉ" validateStatus={errors.address ? 'error' : ''} help={errors.address}>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={handleSave} className="mr-2">Lưu thay đổi</Button>
                  <Button onClick={handleCancel}>Hủy</Button>
                </Form.Item>
              </Form>
            ) : (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Title level={5}>Tên</Title>
                    <p className="bg-gray-200 p-2 rounded-md">{user.firstName}</p>
                  </Col>
                  <Col span={12}>
                    <Title level={5}>Họ</Title>
                    <p className="bg-gray-200 p-2 rounded-md">{user.lastName}</p>
                  </Col>
                </Row>
                <Title level={5}>Email</Title>
                <p className="bg-gray-200 p-2 rounded-md">{user.email}</p>
                <Title level={5}>Số điện thoại</Title>
                <p className="bg-gray-200 p-2 rounded-md">{user.phoneNumber}</p>
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
