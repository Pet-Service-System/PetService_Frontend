import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Form, Input, Layout, Menu, message, Grid, Spin, Modal } from "antd";
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

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
      setReviewError('Review cannot be empty');
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
  
      message.success('Your review has been submitted successfully');
  
      setSpaBookings(prevBookings => prevBookings.map(booking => {
        if (booking.id === reviewTransactionId) {
          return { ...booking, reviewed: true, feedback: reviewText };
        }
        return booking;
      }));
      
      setIsReviewing(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error('Failed to submit review');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <Text>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(record.date)}</Text>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => (
        <Text>${record.amount}</Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Text className={
          record.status === 'Completed' ? 'text-green-600' :
          record.status === 'Pending' || record.status === 'Processing' ? 'text-orange-400' :
          'text-red-600'
        }>
          {record.status}
        </Text>
      )
    },
    {
      title: 'Detail',
      key: 'detail',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/spa-booking-detail/${record.id}`)}>Detail</Button>
      ),
    },
    {
      title: 'Review',
      key: 'review',
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => handleReviewTransaction(record.id)}
          disabled={record.status !== 'Completed' || record.reviewed}
        >
          Review
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
                  key="order-history"
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/order-history')}
                >
                  Lịch sử đặt hàng
                </Menu.Item>
                <Menu.Item key="spa-booking" 
                           onClick={() => navigate('/spa-booking')}
                           icon={<HistoryOutlined />}>
                    Lịch sử dịch vụ
                </Menu.Item>
              </>
            )}
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              Đăng xuất
            </Menu.Item>
          </Menu>
        </Sider>
      )}
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24 }}>
          <h2 className="text-5xl text-center font-semibold mb-4">Spa Service Booking History</h2>
          <Button onClick={handleSortOrder} className="mb-4">
            Sort by date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
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
            title="Submit Review"
            visible={isReviewing}
            onCancel={() => setIsReviewing(false)}
            footer={[
              <Button key="cancel" onClick={() => setIsReviewing(false)}>Cancel</Button>,
              <Button key="submit" type="primary" onClick={handleSubmitReview}>Submit</Button>,
            ]}
          >
            <Form>
              <Form.Item
                label="Review"
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
