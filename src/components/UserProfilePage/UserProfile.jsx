import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Form, Input, message, Grid, Skeleton } from 'antd';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
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
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const screens = useBreakpoint();
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
  const { t } = useTranslation();

  useEffect(() => {
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
      setSaving(true)
      await axios.patch(`http://localhost:3001/api/accounts/${user.id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update user info and localStorage
      localStorage.setItem('user', JSON.stringify(updatedData));
      setUser(updatedData);
      setSaving(false)
      setIsEditMode(false);
      setErrors({});
      message.success(t('information_updated'))
      fetchUserData();
    } catch (error) {
      console.error('Failed to update account:', error);
      message.error(t('updated_fail_try_again'));
      setSaving(false)
    }
  };

  const handleSave = () => {
    let newErrors = {};
    if (!formData.fullname) {
      newErrors.fullname = t('fullname_required');
    } else if (!/^[a-zA-Z\s]*$/.test(formData.fullname)) {
      newErrors.fullname = t('no_special_character');
    }

    if (!formData.phone) {
      newErrors.phone = t('phone_number_required');
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = t('phone_must_have_10_numbers');
    }
    if (!formData.address) newErrors.address = t('address_required');

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
              {t('user_information')}
            </Menu.Item>
            {role === 'Customer' && (
              <>
                <Menu.Item
                  key="pet-list"
                  icon={<UnorderedListOutlined />}
                  onClick={() => navigate('/pet-list')}
                >
                  {t('list_of_pets')}
                </Menu.Item>
                <Menu.Item
                  key="order-history"
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/order-history')}
                >
                  {t('order_history')}
                </Menu.Item>
                <Menu.Item key="spa-booking"
                  onClick={() => navigate('/spa-booking')}
                  icon={<HistoryOutlined />}>
                  {t('service_history')}
                </Menu.Item>
              </>
            )}
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              {t('log_out')}
            </Menu.Item>
          </Menu>
        </Sider>
      )}
      <Layout>
        <Content style={{ margin: '16px', padding: '24px', background: '#fff' }}>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Title level={2} className="text-center">
              {t('user_information')}
            </Title>
            {loading ? (
              <Skeleton active />
            ) : isEditMode ? (
              <Form layout="vertical">
                <Form.Item label={t('fullname_2')} validateStatus={errors.fullname && "error"} help={errors.fullname}>
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
                <Form.Item label={t('phone')} validateStatus={errors.phone && "error"} help={errors.phone}>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Item>
                <Form.Item label={t('adress')} validateStatus={errors.address && "error"} help={errors.address}>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Form.Item>
                <div className="flex justify-between mt-6">
                  <Button type="primary" onClick={handleSave} className="mr-2">{t('save')}</Button>
                  <Button type="default" onClick={handleCancel}>{t('cancel')}</Button>
                </div>
              </Form>
            ) : (
              <>
                <Title level={5}>{t('fullname_2')}</Title>
                <p className="bg-gray-200 p-2 rounded-md">{user.fullname}</p>
                <Title level={5}>Email</Title>
                <p className="bg-gray-200 p-2 rounded-md">{user.email}</p>
                <Title level={5}>{t('phone')}</Title>
                <p className="bg-gray-200 p-2 rounded-md">{user.phone}</p>
                <Title level={5}>{t('adress')}</Title>
                <p className="bg-gray-200 p-2 rounded-md">{user.address}</p>
                <div className="flex justify-between mt-6">
                  <Button type="primary" onClick={handleUpdateInfo} className="mr-2">{t('update_information')}</Button>
                  <Button type="default" onClick={handleChangePassword}>{t('change_password')}</Button>
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
