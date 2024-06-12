import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Modal, Form, Input, Layout, Menu, message, Grid } from "antd";
import { FcCheckmark } from "react-icons/fc";
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import { getTransactionHistory } from "../../apis/ApiTransaction";

const { Text } = Typography;
const { Sider } = Layout;
const { useBreakpoint } = Grid;

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // Trạng thái quản lý thứ tự sắp xếp
  const [isReviewing, setIsReviewing] = useState(false);
  const [isReviewSuccess, setIsReviewSuccess] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewTransactionId, setReviewTransactionId] = useState(null);
  const screens = useBreakpoint();

  useEffect(() => {
    getTransactionHistory().then((data) => {
      const formattedData = data.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date) // Chuyển đổi ngày sang đối tượng Date
      }));
      const sortedData = sortOrder === 'desc' 
        ? formattedData.sort((a, b) => b.date - a.date) 
        : formattedData.sort((a, b) => a.date - b.date);
      setTransactions(sortedData); // Sắp xếp theo ngày
    });
  }, [sortOrder]); // Chạy lại khi sortOrder thay đổi

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
        <Button type="link" onClick={() => navigate(`/transaction-detail/${record.id}`)}>Chi tiết</Button>
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
                  key="transaction-history"
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/transaction-history')}
                >
                  Lịch sử giao dịch
                </Menu.Item>
              </>
            )}
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              Đăng xuất
            </Menu.Item>
          </Menu>
        </Sider>
      )}
      <Layout style={{ padding: '0 24px 24px' }}>
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          <h2 className="text-5xl text-center font-semibold mb-4">Lịch sử giao dịch</h2>
          <Button onClick={handleSortOrder} className="mb-4">
            Sắp xếp theo ngày: {sortOrder === 'desc' ? 'Gần nhất' : 'Xa nhất'}
          </Button>
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="id"
          />
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
}

export default TransactionHistory;
