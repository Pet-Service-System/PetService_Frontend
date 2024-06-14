import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Form, Input, message, Grid, Skeleton } from 'antd';
import axios from 'axios';
import {
  UserOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import SubMenu from 'antd/es/menu/SubMenu';

const { Title } = Typography;
const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const UserProfile = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        navigate('/');
      } else {
        setUser(storedUser);
        setFormData({ ...storedUser });
      }
      setLoading(false);
    };

    fetchUserData();
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

  const updateUserAccount = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }
      await axios.patch(`http://localhost:3001/api/accounts/${user.id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update user info and localStorage
      localStorage.setItem('user', JSON.stringify(updatedData));
      setUser(updatedData);
      setIsEditMode(false);
      setErrors({});
      message.success('Thông tin đã được cập nhật', 1).then(() => {
        window.location.reload()
      })
    } catch (error) {
      console.error('Failed to update account:', error);
      message.error('Cập nhật thông tin thất bại. Vui lòng thử lại.');
    }
  };

  const handleSave = () => {
    let newErrors = {};
    if (!formData.fullname) {
      newErrors.fullname = 'Họ và tên là bắt buộc';
    } else if (!/^[a-zA-Z\s]*$/.test(formData.fullname)) {
      newErrors.fullname = 'Họ và tên không được chứa ký tự đặc biệt';
    }

    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải chứa đúng 10 chữ số';
    }
    if (!formData.address) newErrors.address = 'Địa chỉ là bắt buộc';

    if (Object.keys(newErrors).length === 0) {
      updateUserAccount(formData);
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
    setRole('Guest');
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
            {role === 'Customer' && (
              <>
                <Menu.Item
                  key="pet-list"
                  icon={<UnorderedListOutlined />}
                  onClick={() => navigate('/pet-list')}
                >
                  Danh sách thú cưng
                </Menu.Item>
                <Menu.Item
                  key="orders-history"
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/orders-history')}
                >
                  Lịch sử đặt hàng
                </Menu.Item>
                <SubMenu
                  key="service-history"
                  icon={<HistoryOutlined />}
                  title="Lịch sử dịch vụ"
                >
                  <Menu.Item key="service-booking" onClick={() => navigate('/service-booking')}>
                    Dịch vụ thú cưng
                  </Menu.Item>
                  <Menu.Item key="hotel-booking" onClick={() => navigate('/hotel-booking')}>
                    Dịch vụ khách sạn
                  </Menu.Item>
                </SubMenu>
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
            {loading ? (
              <Skeleton active />
            ) : isEditMode ? (
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
