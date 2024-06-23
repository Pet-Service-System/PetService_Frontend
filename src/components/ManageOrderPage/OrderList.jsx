import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, Spin, message, Modal } from "antd";
import axios from 'axios';

const { Text } = Typography;
const { confirm } = Modal;

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [role] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false);

  const getOrderHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:3001/api/orders/`, {
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
    setLoading(true);
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
      setOrders(sortedData);
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortOrder = () => {
    setSortOrder(prevSortOrder => prevSortOrder === 'desc' ? 'asc' : 'desc');
  };

  const showConfirm = (orderId, newStatus) => {
    confirm({
      title: 'Are you sure you want to update the order status?',
      content: `Change status to "${newStatus}"?`,
      onOk() {
        handleUpdateStatus(orderId, newStatus);
      },
      onCancel() {
        console.log('Cancelled');
      },
    });
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:3001/api/orders/${orderId}`, 
        { Status: newStatus }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success('Order status updated successfully');
      fetchOrderHistory(); // Refresh order list after update
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Processing':
      case 'Delivering':
        return { color: 'orange' };
      case 'Shipped':
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
        case 'Processing':
          return (
            <div>
              <Button type="primary" className="w-36 mr-2" onClick={() => showConfirm(record.id, 'Delivering')}>
                Delivering
              </Button>
              <Button danger className="w-36" onClick={() => showConfirm(record.id, 'Canceled')}>
                Cancel
              </Button>
            </div>
          );
        case 'Delivering':
          return (
            <div>
              <Button type="primary" className="w-36 mr-2" onClick={() => showConfirm(record.id, 'Shipped')}>
                Shipped
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
      render: (text, record) => (
        <Text style={getStatusStyle(record.status)}>{record.status}</Text>
      )
    },
    {
      title: 'Chi tiết',
      key: 'detail',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/orders-history-detail/${record.id}`)}>Chi tiết</Button>
      ),
    },
    {
      title: 'Cập nhật trạng thái',
      key: 'updateStatus',
      render: (text, record) => renderUpdateButton(record),
    },
  ].filter(col => col.key !== 'updateStatus' || role === 'Sales Staff'); // Filter out 'updateStatus' column if not Sales Staff

  return (
    <Layout style={{ minHeight: '80vh' }}>
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          <h2 className="text-5xl text-center font-semibold mb-4">Danh sách đặt hàng</h2>
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
        </div>
      </Layout>
    </Layout>
  );
};

export default OrderList;
