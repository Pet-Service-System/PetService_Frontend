import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Form, Input, message, Grid, Skeleton, Card, Progress, Steps } from 'antd';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { setShoppingCart } from '../../redux/shoppingCart';
import {
  UserOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';

const { Title } = Typography;
const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const API_URL = import.meta.env.REACT_APP_API_URL;

const UserProfile = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [accountData, setAccountData] = useState({});
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    getAccount()
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

  const getAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/accounts/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAccountData(response.data.user);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserAccount = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }
      setSaving(true)
      await axios.patch(`${API_URL}/api/accounts/${user.id}`, updatedData, {
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

  const handleLogout = async () => {
    const accountID = user.id;
    const cartItems = JSON.parse(localStorage.getItem('shoppingCart')) || []; // Parse the cart items from localStorage
    console.log('User ID:', accountID);
    console.log('Cart Items:', cartItems);

    if (cartItems.length > 0) {
      try {
        const response = await axios.post(`${API_URL}/api/cart`, {
          AccountID: accountID, // Use accountID variable instead of undefined response.AccountID
          Items: cartItems, // Pass the parsed cartItems directly
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Cart saved successfully:', response.data);
      } catch (error) {
        console.error('Error saving cart:', error);
        // Handle specific error scenarios if needed
      }
    }

    localStorage.clear();
    dispatch(setShoppingCart([]));
    setRole('Guest');
    setUser(null);
    navigate('/', { replace: true });
  };

  // Calculate Progress for Membership Tiers
  const totalSpent = accountData.totalSpent || 0;

  // Constants for membership thresholds
  const BASIC_THRESHOLD = 0;
  const PREMIUM_THRESHOLD = 1500000;
  const VIP_THRESHOLD = 3000000;

  // Determine current tier
  const currentTier = totalSpent >= VIP_THRESHOLD
    ? 'VIP'
    : totalSpent >= PREMIUM_THRESHOLD
      ? 'Premium'
      : 'Basic';

  // Calculate progress for next tier
  const nextTierThreshold = currentTier === 'Basic'
    ? PREMIUM_THRESHOLD
    : currentTier === 'Premium'
      ? VIP_THRESHOLD
      : VIP_THRESHOLD;

  const progressPercentage = totalSpent >= VIP_THRESHOLD
    ? 100
    : ((totalSpent - (currentTier === 'Basic' ? BASIC_THRESHOLD : PREMIUM_THRESHOLD)) /
      (nextTierThreshold - (currentTier === 'Basic' ? BASIC_THRESHOLD : PREMIUM_THRESHOLD))) * 100;

  // Icons for membership tiers
  const tierIcon = currentTier === 'VIP'
    ? '👑'
    : currentTier === 'Premium'
      ? '💎'
      : '🤍';

  // Determine the current step index
  const currentStepIndex =
    totalSpent >= VIP_THRESHOLD
      ? 2
      : totalSpent >= PREMIUM_THRESHOLD
      ? 1
      : 0;

  // Calculate progress for each tier
  const progressSteps = [
    { 
      title: 'Basic',
      icon: '🤍',
      threshold: BASIC_THRESHOLD,
      description: `0đ`,
      color: '#108ee9',
    },
    {
      title: 'Premium',
      icon: '💎',
      threshold: PREMIUM_THRESHOLD,
      description: `1,500,000đ`,
      color: '#1890ff',
    },
    {
      title: 'VIP',
      icon: '👑',
      threshold: VIP_THRESHOLD,
      description: `3,000,000đ`,
      color: '#fadb14',
    },
  ];

  return (
    <Layout style={{ minHeight: '80vh' }}>
      {/* Sider */}
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
      {/* User information and buttons */}
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
                    prefix={<UserOutlined />}
                    value={formData.fullname}
                    onChange={handleChange}
                    disabled={!isEditMode} // Thêm disabled khi không phải chế độ chỉnh sửa
                  />
                </Form.Item>
                <Form.Item label="Email">
                  <Input
                    name="email"
                    prefix={<MailOutlined />}
                    value={formData.email}
                    disabled
                  />
                </Form.Item>
                <Form.Item label={t('phone')} validateStatus={errors.phone && "error"} help={errors.phone}>
                  <Input
                    name="phone"
                    prefix={<PhoneOutlined />}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditMode} // Thêm disabled khi không phải chế độ chỉnh sửa
                  />
                </Form.Item>
                <Form.Item label={t('adress')} validateStatus={errors.address && "error"} help={errors.address}>
                  <Input
                    name="address"
                    prefix={<HomeOutlined />}
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditMode} // Thêm disabled khi không phải chế độ chỉnh sửa
                  />
                </Form.Item>
                <div className="flex justify-between mt-6">
                  <Button type="primary" onClick={handleSave} className="mr-2" disabled={saving}>{t('save')}</Button>
                  <Button type="default" onClick={handleCancel} disabled={saving}>{t('cancel')}</Button>
                </div>
              </Form>
            ) : (
              <>
                <Title level={5}>{t('fullname_2')}</Title>
                <p className="bg-gray-200 p-2 rounded-md"><UserOutlined className='mr-2' />{user.fullname}</p>
                <Title level={5}>Email</Title>
                <p className="bg-gray-200 p-2 rounded-md"><MailOutlined className='mr-2' />{user.email}</p>
                <Title level={5}>{t('phone')}</Title>
                <p className="bg-gray-200 p-2 rounded-md"><PhoneOutlined className='mr-2' />{user.phone}</p>
                <Title level={5}>{t('adress')}</Title>
                <p className="bg-gray-200 p-2 rounded-md"><HomeOutlined className='mr-2' />{user.address}</p>
                <div className="flex justify-between mt-6">
                  <Button type="primary" onClick={handleUpdateInfo} className="mr-2">{t('update_information')}</Button>
                  <Button type="default" onClick={handleChangePassword}>{t('change_password')}</Button>
                </div>
              </>
            )}
          </div>
          {/* Render Account Information Card */}
          {/* {!isEditMode && role === 'Customer' && (
            <Card bordered={false} style={{ marginTop: '24px' }}>
              <Typography.Title level={2} className="text-center">
                 {t('Thông tin hội viên')}
              </Typography.Title>
              <div className="bg-gray-200 p-2 rounded-md mb-2">
                <Title level={5}>{t('Loại hội viên')}</Title>
                <p>{tierIcon}{accountData.membershipType || t('no_data')}</p>
              </div>

              <div className="bg-gray-200 p-2 rounded-md mb-2">
                <Title level={5}>{t('Tổng tiền tiêu')}</Title>
                <p>
                  <LineChartOutlined className="mr-2" />{accountData.totalSpent || 0}đ
                </p>
              </div>

              <Steps
                current={currentStepIndex}
                progressDot={(dot, { index }) => (
                  <span className="ant-steps-icon-dot" style={{ fontSize: '24px' }}>
                    {progressSteps[index].icon}
                  </span>
                )}
                style={{ margin: '20px 0' }}
                labelPlacement="vertical"
              >
                {progressSteps.map((step, index) => (
                  <Steps.Step
                    key={index}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </Steps>

              <div className="bg-gray-200 p-2 rounded-md mb-2">
                <Progress
                  percent={progressPercentage.toFixed(1)} // Fix to 1 decimal
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  format={(percent) => `${Number(percent).toFixed(1)}% ${t('tới')} ${currentTier === 'Basic' ? 'Premium' : currentTier === 'Premium' ? 'VIP' : 'VIP'}`}
                />
              </div>

              <div className="bg-gray-200 p-2 rounded-md mb-2">
                <Title level={5}>{t('Ngày bắt đầu hội viên')}</Title>
                <p>{accountData.startDate ? new Date(accountData.startDate).toLocaleDateString() : t('-')}</p>
              </div>

              <div className="bg-gray-200 p-2 rounded-md mb-2">
                <Title level={5}>{t('Ngày kết thúc hội viên')}</Title>
                <p>{accountData.endDate ? new Date(accountData.endDate).toLocaleDateString() : t('-')}</p>
              </div>
            </Card>
          )} */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserProfile;
