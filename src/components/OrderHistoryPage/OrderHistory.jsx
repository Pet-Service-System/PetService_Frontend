import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, Menu, Grid, Spin } from "antd";
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useDispatch } from "react-redux";
import { setShoppingCart } from '../../redux/shoppingCart';

const { Text } = Typography;
const { Sider } = Layout;
const { useBreakpoint } = Grid;
const API_URL = import.meta.env.REACT_APP_API_URL;

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [isReviewSuccess, setIsReviewSuccess] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const screens = useBreakpoint();
  const dispatch = useDispatch();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const AccountID = user.id
  const { t } = useTranslation();

  const getOrderHistory = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/api/orders/account/${AccountID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const sanitizedData = response.data.map(order => ({
      OrderID: order.OrderID,
      OrderDate: order.OrderDate,
      Status: order.Status,
      TotalPrice: order.TotalPrice,
      AccountID: order.AccountID,
    }));

    console.log('Fetched data:', sanitizedData);
    return sanitizedData;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
};

  useEffect(() => {
    fetchOrderHistory();
  }, [sortOrder]);

  const fetchOrderHistory = async () => {
    setLoading(true); // Start loading indicator
    try {
      const data = await getOrderHistory();
      const formattedData = data.map(order => ({
        id: order.OrderID,
        date: order.OrderDate,
        status: order.Status,
        amount: order.TotalPrice
      }));
      const sortedData = sortOrder === 'desc'
        ? formattedData.sort((a, b) => moment(b.date).diff(a.date))
        : formattedData.sort((a, b) => moment(a.date).diff(b.date));
      setOrders(sortedData); // Sắp xếp theo ngày
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  useEffect(() => {
    let timeout;
    if (isReviewSuccess) {
      timeout = setTimeout(() => {
        setIsReviewSuccess(false);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [isReviewSuccess]);

  const handleSortOrder = () => {
    setSortOrder(prevSortOrder => prevSortOrder === 'desc' ? 'asc' : 'desc');
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/order-history-detail/${record.id}`)}>{record.id}</Button>
      ),
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <Text>{moment(record.date).format('DD/MM/YYYY HH:mm')}</Text> // Format date using moment.js
      ),
    },
    {
      title: t('amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => (
        <Text className="text-green-600">{record.amount.toLocaleString('en-US')}</Text>
      )
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Text className={
          record.status === 'Shipped' ? 'text-green-600' :
            record.status === 'Pending' ? 'text-yellow-500' :
            record.status === 'Processing' ? 'text-orange-600' :
              'text-red-600'
        }>
          {record.status}
        </Text>
      )
    },
  ];

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
                  key="orders-history"
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
      {/* Table */}
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          <h2 className="text-5xl text-center font-semibold mb-4">{t('order_history')}</h2>
          <Button onClick={handleSortOrder} className="mb-4">
            {t('sort_by_date')}: {sortOrder === 'desc' ? t('nearest') : t('farthest')}
          </Button>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={orders}
              scroll={{ x: 'max-content' }}
              rowKey="id"
            />
          </Spin>
        </div>
      </Layout>
    </Layout>
  );
};

export default OrderHistory;
