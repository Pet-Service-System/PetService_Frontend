import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, Menu, Grid, Spin, Tag, DatePicker, Tabs } from "antd";
import { UserOutlined, 
         UnorderedListOutlined, 
         HistoryOutlined, 
         LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useDispatch } from "react-redux";
import { setShoppingCart } from '../../redux/shoppingCart';
import '../../styles/style.css'

const { Text } = Typography;
const { Sider } = Layout;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;
const API_URL = import.meta.env.REACT_APP_API_URL;

const OrderHistory = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null); 
  const [orders, setOrders] = useState([]);
  const [sortOrder] = useState('desc');
  const [isReviewSuccess, setIsReviewSuccess] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false); 
  const screens = useBreakpoint();
  const dispatch = useDispatch();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const AccountID = user.id;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all'); 
  const [orderCounts, setOrderCounts] = useState({
    all: 0,
    Processing: 0,
    Delivering: 0,
    Shipped: 0,
    Canceled: 0
  });

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

      const counts = sanitizedData.reduce((acc, order) => {
        acc.all += 1;
        acc[order.Status] += 1;
        return acc;
      }, {
        all: 0,
        Processing: 0,
        Delivering: 0,
        Shipped: 0,
        Canceled: 0
      });

      setOrderCounts(counts);

      console.log('Fetched data:', sanitizedData);
      return sanitizedData;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getOrderHistory();
        const formattedData = data.map(order => ({
          id: order.OrderID,
          date: order.OrderDate,
          status: order.Status,
          amount: order.TotalPrice
        }));
  
        let filteredData = formattedData;
  
        if (activeTab !== 'all') {
          filteredData = filteredData.filter(order => order.status === activeTab);
        }
  
        if (selectedDate) {
          filteredData = filteredData.filter(order =>
            moment(order.date).isSame(selectedDate, 'day')
          );
        }
  
        const sortedData = sortOrder === 'desc'
          ? filteredData.sort((a, b) => moment(b.date).diff(a.date))
          : filteredData.sort((a, b) => moment(a.date).diff(b.date));
  
        setOrders(sortedData);
      } catch (error) {
        console.error('Error fetching order history:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [sortOrder, activeTab, selectedDate]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      className: 'sticky left-0 bg-white',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/order-history-detail/${record.id}`)}>{record.id}</Button>
      ),
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
      render: (text, record) => (
        <Text>{moment(record.date).format('DD/MM/YYYY HH:mm')}</Text>
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
        <Tag className='min-w-[70px] w-auto px-2 py-1 text-center' color={record.status === 'Shipped' ? 
                    'green' : record.status === 'Pending' ? 
                    'orange' : record.status === 'Processing' ? 
                    'blue' : 'red'}>
          {record.status}
        </Tag>
      )
    },
  ];

  const handleLogout = async () => {
    const accountID = user.id;
    const cartItems = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    console.log('User ID:', accountID);
    console.log('Cart Items:', cartItems);
  
    if (cartItems.length > 0) {
      try {
        const response = await axios.post(`${API_URL}/api/cart`, {
          AccountID: accountID,
          Items: cartItems,
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Cart saved successfully:', response.data);
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  
    localStorage.clear();
    dispatch(setShoppingCart([]));
    setRole('Guest');
    setUser(null);
    navigate('/', { replace: true });
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date.toDate());
    } else {
      setSelectedDate(null);
    }
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
      <Layout className="site-layout">
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Typography.Title className="text-center font-semibold mb-4">{t('order_history')}</Typography.Title>
            <Layout className="flex lg:flex-row sm:flex-col mt-10 mb-4 lg:items-end">
              <div>
                <Text>{t('filter_order_date')}: </Text>
                <DatePicker
                  onChange={handleDateChange}
                  style={{ width: 200 }}
                />
              </div>
            </Layout>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
              <TabPane tab={<span>{t('all')} <span className="inline-block bg-gray-200 text-gray-800 text-md font-semibold px-3 py-1 w-11 h-11 text-center">{orderCounts.all}</span></span>} key="all" />
              <TabPane tab={<span>{t('Processing')} <span className="inline-block bg-blue-200 text-blue-800 text-md font-semibold px-3 py-1 w-11 h-11 text-center">{orderCounts.Processing}</span></span>} key="Processing" />
              <TabPane tab={<span>{t('Delivering')} <span className="inline-block bg-orange-200 text-orange-800 text-md font-semibold px-3 py-1 w-11 h-11 text-center">{orderCounts.Delivering}</span></span>} key="Delivering" />
              <TabPane tab={<span>{t('Shipped')} <span className="inline-block bg-green-200 text-green-800 text-md font-semibold px-3 py-1 w-11 h-11 text-center">{orderCounts.Shipped}</span></span>} key="Shipped" />
              <TabPane tab={<span>{t('Canceled')} <span className="inline-block bg-red-200 text-red-800 text-md font-semibold px-3 py-1 w-11 h-11 text-center">{orderCounts.Canceled}</span></span>} key="Canceled" />
            </Tabs>
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={orders}
                scroll={{ x: 'max-content' }}
                rowKey="id"
                className="custom-table"
              />
            </Spin>
          </div>
        </Layout>
    </Layout>
  );
};

export default OrderHistory;
