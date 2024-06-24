import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Form, Input, Layout, Menu, message, Grid, Spin } from "antd";
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import SubMenu from "antd/es/menu/SubMenu";

const { Text } = Typography;
const { Sider } = Layout;
const { useBreakpoint } = Grid;

const BookingList = () => {
  const navigate = useNavigate();
  const [hotelBookings, setHotelBookings] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewTransactionId, setReviewTransactionId] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const screens = useBreakpoint();

  const getHotelBookingHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:3001/api/Hotel-bookings/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchHotelBookings();
  }, [sortOrder]);

  const fetchHotelBookings = async () => {
    setLoading(true); // Start loading indicator
    try {
      const data = await getHotelBookingHistory();
      const formattedData = data.map(booking => ({
        id: booking.BookingDetailID, // Adjust as per your backend response
        date: new Date(booking.CreateDate), // Adjust as per your backend response
        description: booking.BookingDetails[0].HotelID, // Adjust as per your backend response
        amount: booking.BookingDetails[0].TotalPrice, // Adjust as per your backend response
        status: booking.Status // Adjust as per your backend response
      }));
      const sortedData = sortOrder === 'desc'
        ? formattedData.sort((a, b) => b.date - a.date)
        : formattedData.sort((a, b) => a.date - b.date);
      setHotelBookings(sortedData);
    } catch (error) {
      console.error('Error fetching hotel bookings:', error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const handleSortOrder = () => {
    setSortOrder(prevSortOrder => prevSortOrder === 'desc' ? 'asc' : 'desc');
  };

  const showConfirm = (hotelID, newStatus) => {
    confirm({
      title: 'Are you sure you want to update the hotel booking status?',
      content: `Change status to "${newStatus}"?`,
      onOk() {
        handleUpdateStatus(hotelID, newStatus);
      },
      onCancel() {
        console.log('Cancelled');
      },
    });
  };

  const handleUpdateStatus = async (hotelID, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:3001/api/Hotel-bookings/${hotelID}`,
        { Status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success('hotel booking status updated successfully');
      fetchOrderHistory(); // Refresh order list after update
    } catch (error) {
      console.error('Error updating hotel booking status:', error);
      message.error('Failed to update hotel booking status');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return { color: 'blue' };
      case 'Processing':
        return { color: 'orange' };
      case 'Completed':
        return { color: 'green' };
      case 'Canceled':
        return { color: 'red' };
      default:
        return {};
    }
  };

  const renderUpdateButton = (record) => {
    if (role === 'Sales Staff') {
      switch (record.status) {
        case 'Pending':
          return (
            <div>
              <Button type="primary" className="w-36 mr-2" onClick={() => showConfirm(record.id, 'Processing')}>
                Processing
              </Button>
              <Button danger className="w-36" onClick={() => showConfirm(record.id, 'Canceled')}>
                Cancel
              </Button>
            </div>
          );
        case 'Processing':
          return (
            <div>
              <Button type="primary" className="w-36 mr-2" onClick={() => showConfirm(record.id, 'Completed')}>
                Completed
              </Button>
              <Button danger className="w-36" onClick={() => showConfirm(record.id, 'Canceled')}>
                Cancel
              </Button>
            </div>
          );
        default:
          return null;
      }
    } else {
      return null;
    }
  };


  const handleReviewTransaction = (id) => {
    setReviewTransactionId(id);
    setReviewText('');
    setReviewError('');
  };

  const handleSubmitReview = () => {
    if (reviewText.trim() === '') {
      setReviewError('Review cannot be empty');
      return;
    }

    // Placeholder for actual review submission logic
    message.success('Your review has been submitted successfully');
    setReviewTransactionId(null); // Close the review form
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
        <Text>{new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(record.date)}</Text>
      )
    },
    {
      title: 'Hotel ID',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Total Price',
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
        <Text style={getStatusStyle(record.status)}>{record.status}</Text>
      )
    },    
    {
      title: 'Detail',
      key: 'detail',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/hotel-booking-detail/${record.id}`)}>Detail</Button>
      ),
    },
    {
      title: 'Cập nhật trạng thái',
      key: 'updateStatus',
      render: (text, record) => renderUpdateButton(record),
    },
    {
      title: 'Review',
      key: 'review',
      render: (text, record) => (
        <div>
          <Button type="primary" onClick={() => handleReviewTransaction(record.id)}>Review</Button>
          {reviewTransactionId === record.id && (
            <Form layout="vertical" onFinish={handleSubmitReview}>
              <Form.Item
                label="Review"
                validateStatus={reviewError ? 'error' : ''}
                help={reviewError}
              >
                <Input.TextArea value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">Submit</Button>
                <Button onClick={() => setReviewTransactionId(null)}>Cancel</Button>
              </Form.Item>
            </Form>
          )}
        </div>
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
                  <Menu.Item key="spa-booking" onClick={() => navigate('/spa-booking')}>
                    Dịch vụ spa
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
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          <h2 className="text-5xl text-center font-semibold mb-4">Lịch sử đặt lịch khách sạn</h2>
          <Button onClick={handleSortOrder} className="mb-4">
            Sort by Date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </Button>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={hotelBookings}
              rowKey="id"
              scroll={{ x: true }}
            />
          </Spin>
        </div>
      </Layout>
    </Layout>
  );
};

export default BookingList;
