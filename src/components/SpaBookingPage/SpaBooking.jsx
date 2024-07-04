import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Form, Input, Layout, Menu, message, Grid, Spin, Modal } from "antd";
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import moment from "moment";
import { useTranslation } from 'react-i18next';
import { useDispatch } from "react-redux";
import { setShoppingCart } from '../../redux/shoppingCart';

const { Text } = Typography;
const { Sider } = Layout;
const { useBreakpoint } = Grid;
const API_URL = import.meta.env.REACT_APP_API_URL;

const getSpaBookings = async () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const AccountID = user.id
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/api/Spa-bookings/account/${AccountID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching spa bookings:', error);
    throw error;
  }
}

const SpaBooking = () => {
  const navigate = useNavigate();
  const [spaBookings, setSpaBookings] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [bookingID, setBookingID] = useState(null);
  const [bookingDetailID, setBookingDetailID] = useState(null); // Moved to useState
  const dispatch = useDispatch();
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false);
  const screens = useBreakpoint();
  const { t } = useTranslation();

  useEffect(() => {
    fetchSpaBookings();
  }, [sortOrder]);

  const fetchSpaBookings = async () => {
    setLoading(true);
    try {
      const data = await getSpaBookings();
      const formattedData = data.map(booking => ({
        id: booking.BookingID,
        date: new Date(booking.CreateDate),
        TotalPrice: booking.TotalPrice,
        status: booking.Status,
        isReviewed: booking.isReviewed // Thêm trường isReviewed vào đối tượng booking
      }));
      const sortedData = sortOrder === 'desc'
        ? formattedData.sort((a, b) => b.date - a.date)
        : formattedData.sort((a, b) => a.date - b.date);
      setSpaBookings(sortedData);

      // Load booking detail ID for the first booking if available
      if (formattedData.length > 0) {
        await getSpaBookingDetailID(formattedData[0].id);
      }
    } catch (error) {
      console.error('Error fetching spa bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortOrder = () => {
    setSortOrder(prevSortOrder => prevSortOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleReviewTransaction = async (id, isReviewed) => {
    // Kiểm tra xem đã được đánh giá hay chưa
    if (isReviewed) {
      message.info('Bạn đã đánh giá dịch vụ này rồi.');
      return;
    }

    setBookingID(id);
    setIsReviewing(true);
    setReviewText('');
    setReviewError('');

    // Load booking detail ID when reviewing
    await getSpaBookingDetailID(id);
  };

  const getSpaBookingDetailID = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/spa-booking-details/booking/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookingDetailID(response.data.BookingDetailsID);
      return response.data;
    } catch (error) {
      console.error('Error fetching spa booking detail:', error);
      throw error;
    }
  }

  const handleSubmitReview = async () => {
    if (reviewText.trim() === '') {
      setReviewError(t('review_error_empty'));
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API_URL}/api/spa-booking-details/${bookingDetailID}`,
        { Feedback: reviewText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success(t('review_success'));

      setSpaBookings(prevBookings => prevBookings.map(booking => {
        if (booking.id === bookingID) {
          return { ...booking, isReviewed: true }; // Cập nhật trạng thái isReviewed khi đã đánh giá
        }
        return booking;
      }));

      setIsReviewing(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error(t('review_fail'));
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/spa-booking-detail/${record.id}`)}>{record.id}</Button>
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
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Text className={
          record.status === 'Completed' ? 'text-green-600' :
            record.status === 'Pending' ? 'text-yellow-500' :
            record.status === 'Processing' ? 'text-orange-600' :
              'text-red-600'
        }>
          {record.status}
        </Text>
      )
    },
    {
      title: t('review'),
      key: 'review',
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => handleReviewTransaction(record.id, record.isReviewed)} // Truyền trạng thái isReviewed vào hàm
          disabled={record.status !== 'Completed' || record.isReviewed}
        >
          {t('review')}
        </Button>
      ),
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
    <Layout style={{ minHeight: '100vh' }}>
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
              {t('user_profile')}
            </Menu.Item>
            {role === 'Customer' && (
              <>
                <Menu.Item
                  key="pet-list"
                  icon={<UnorderedListOutlined />}
                  onClick={() => navigate('/pet-list')}
                >
                  {t('pet_list')}
                </Menu.Item>
                <Menu.Item
                  key="order-history"
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/order-history')}
                >
                  {t('orders_history')}
                </Menu.Item>
                <Menu.Item key="spa-booking"
                  onClick={() => navigate('/spa-booking')}
                  icon={<HistoryOutlined />}>
                  {t('spa_booking')}
                </Menu.Item>
              </>
            )}
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              {t('logout')}
            </Menu.Item>
          </Menu>
        </Sider>
      )}
      {/* Table and sort button */}
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24 }}>
          <h2 className="text-5xl text-center font-semibold mb-4">{t('spa_booking_history')}</h2>
          <Button onClick={handleSortOrder} className="mb-4">
            {t('sort_by_date')}: {sortOrder === 'desc' ? t('newest') : t('oldest')}
          </Button>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={spaBookings}
              rowKey="id"
              scroll={{ x: '100%' }}
            />
          </Spin>
          <Modal
            title={t('submit_review')}
            visible={isReviewing}
            onCancel={() => setIsReviewing(false)}
            footer={[
              <Button key="cancel" onClick={() => setIsReviewing(false)}>{t('cancel')}</Button>,
              <Button key="submit" type="primary" onClick={handleSubmitReview}>{t('submit')}</Button>,
            ]}
          >
            <Form>
              <Form.Item
                label={t('review')}
                validateStatus={reviewError ? 'error' : ''}
                help={reviewError}
              >
                <Input.TextArea value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Layout>
    </Layout>
  );
};

export default SpaBooking;
