import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Form, Input, Layout, Menu, message, Grid, Spin, Modal } from "antd";
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import moment from "moment";

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
  const [bookingID, setBookingID] = useState(null);
  const [bookingDetailID, setBookingDetailID] = useState(null); // Moved to useState

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
      const response = await axios.get(`http://localhost:3001/api/spa-booking-details/booking/${id}`, {
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
      setReviewError('Review cannot be empty');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:3001/api/spa-booking-details/${bookingDetailID}`, 
        { Feedback: reviewText }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      message.success('Your review has been submitted successfully');
  
      setSpaBookings(prevBookings => prevBookings.map(booking => {
        if (booking.id === bookingID) {
          return { ...booking, isReviewed: true }; // Cập nhật trạng thái isReviewed khi đã đánh giá
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
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/spa-booking-detail/${record.id}`)}>{record.id}</Button>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <Text>{moment(record.date).format('DD/MM/YYYY HH:mm')}</Text> // Format date using moment.js
      ),
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
      title: 'Review',
      key: 'review',
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => handleReviewTransaction(record.id, record.isReviewed)} // Truyền trạng thái isReviewed vào hàm
          disabled={record.status !== 'Completed' || record.isReviewed}
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
