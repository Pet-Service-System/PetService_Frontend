import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Form, Input, Layout, Menu, message, Grid, Spin, Modal } from "antd";
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;
const { Sider } = Layout;
const { useBreakpoint } = Grid;

const getSpaBookings = async () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const AccountID = user.id
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/Spa-bookings/account/${AccountID}`, {
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
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewTransactionId, setReviewTransactionId] = useState(null);
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
        id: booking.BookingDetailID,
        date: new Date(booking.CreateDate),
        description: booking.PetID,
        amount: booking.TotalPrice,
        status: booking.Status,
        reviewed: booking.Reviewed,
      }));
      const sortedData = sortOrder === 'desc'
        ? formattedData.sort((a, b) => b.date - a.date)
        : formattedData.sort((a, b) => a.date - b.date);
      setSpaBookings(sortedData);
    } catch (error) {
      console.error('Error fetching spa bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortOrder = () => {
    setSortOrder(prevSortOrder => prevSortOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleReviewTransaction = (id) => {
    setReviewTransactionId(id);
    setIsReviewing(true);
    setReviewText('');
    setReviewError('');
  };

  const handleSubmitReview = async () => {
    if (reviewText.trim() === '') {
      setReviewError(t('review_error_empty'));
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:3001/api/Spa-bookings/submit-review/${reviewTransactionId}`,
        { feedback: reviewText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success(t('review_success'));

      setSpaBookings(prevBookings => prevBookings.map(booking => {
        if (booking.id === reviewTransactionId) {
          return { ...booking, reviewed: true, feedback: reviewText };
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
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <Text>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(record.date)}</Text>
      )
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => (
        <Text>${record.amount}</Text>
      )
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Text className={
          record.status === 'Completed' ? 'text-green-600' :
            record.status === 'Pending' || record.status === 'Processing' ? 'text-orange-400' :
              'text-red-600'
        }>
          {t(record.status.toLowerCase())}
        </Text>
      )
    },
    {
      title: t('detail'),
      key: 'detail',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/spa-booking-detail/${record.id}`)}>{t('detail')}</Button>
      ),
    },
    {
      title: t('review'),
      key: 'review',
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => handleReviewTransaction(record.id)}
          disabled={record.status !== 'Completed' || record.reviewed}
        >
          {t('review')}
        </Button>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setRole('Guest');
    navigate('/');
    window.location.reload();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
                  key="pet_list"
                  icon={<UnorderedListOutlined />}
                  onClick={() => navigate('/pet-list')}
                >
                  {t('pet_list')}
                </Menu.Item>
                <Menu.Item
                  key="orders_history"
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/orders-history')}
                >
                  {t('orders_history')}
                </Menu.Item>
                <Menu.Item key="spa_booking"
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