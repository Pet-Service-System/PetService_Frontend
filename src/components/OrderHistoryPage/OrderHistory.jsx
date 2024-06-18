import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Modal, Form, Input, Layout, Menu, message, Grid, Spin } from "antd";
import { FcCheckmark } from "react-icons/fc";
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import SubMenu from "antd/es/menu/SubMenu";

const { Text } = Typography;
const { Sider } = Layout;
const { useBreakpoint } = Grid;

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // Trạng thái quản lý thứ tự sắp xếp
  const [isReviewing, setIsReviewing] = useState(false);
  const [isReviewSuccess, setIsReviewSuccess] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewTransactionId, setReviewTransactionId] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const screens = useBreakpoint();
  const [user] = useState(JSON.parse(localStorage.getItem('user')))
  const AccountID = user.id

  const getOrderHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:3001/api/orders/account/${AccountID}`, {
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
    fetchOrderHistory();
  }, [sortOrder]);

  const fetchOrderHistory = async () => {
    setLoading(true); // Start loading indicator
    try {
      const data = await getOrderHistory();
      const formattedData = data.map(order => ({
        id: order.OrderID,
        date: new Date(order.OrderDate),
        description: order.Address,
        amount: order.TotalPrice,
        status: order.Status
      }));
      const sortedData = sortOrder === 'desc' 
        ? formattedData.sort((a, b) => b.date - a.date) 
        : formattedData.sort((a, b) => a.date - b.date);
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

  const handleReviewTransaction = (id) => {
    setReviewTransactionId(id);
    setIsReviewing(true);
    setReviewText('');
    setReviewError('');
  };

  const handleSubmitReview = () => {
    if (reviewText.trim() === '') {
      setReviewError('Đánh giá không được để trống');
      return;
    }

    // Xử lý gửi đánh giá ở đây
    setIsReviewSuccess(true);
    setIsReviewing(false);
    setReviewText('');
    message.success('Đánh giá của bạn đã được gửi thành công');
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <Text>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(record.date)}</Text>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => (
        <Text>${record.amount}</Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Chi tiết',
      key: 'detail',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/orders-history-detail/${record.id}`)}>Chi tiết</Button>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'review',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleReviewTransaction(record.id)}>Đánh giá</Button>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('account_id');
    localStorage.removeItem('fullname');
    localStorage.removeItem('email');
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
          <h2 className="text-5xl text-center font-semibold mb-4">Lịch sử đặt hàng</h2>
          <Button onClick={handleSortOrder} className="mb-4">
            Sắp xếp theo ngày: {sortOrder === 'desc' ? 'Gần nhất' : 'Xa nhất'}
          </Button>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={orders}
              scroll={{ x: 'max-content' }}
              rowKey="id"
            />
          </Spin>
          <Modal
            title={`Đánh giá giao dịch #${reviewTransactionId}`}
            visible={isReviewing}
            onOk={handleSubmitReview}
            onCancel={() => setIsReviewing(false)}
          >
            <Form>
              <Form.Item label="Đánh giá" validateStatus={reviewError ? 'error' : ''} help={reviewError}>
                <Input.TextArea value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="Thông báo"
            visible={isReviewSuccess}
            onCancel={() => setIsReviewSuccess(false)}
            footer={null}
          >
            <div className="flex justify-center items-center">
              <FcCheckmark className="text-green-500 mr-4" />
              <span>Đánh giá của bạn đã được gửi thành công!</span>
            </div>
          </Modal>
        </div>
      </Layout>
    </Layout>
  );
};

export default OrderHistory;
