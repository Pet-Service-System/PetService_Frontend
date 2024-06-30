import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, Spin, message, Modal, Input } from "antd";
import axios from 'axios';
import moment from "moment";

const { Text } = Typography;
const { confirm } = Modal;
const { Search } = Input

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [role] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getOrderHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:3001/api/orders/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orders = response.data;

      // Fetch order details for each order
      const orderDetailsPromises = orders.map(order =>
        axios.get(`http://localhost:3001/api/order-details/order/${order.OrderID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      const orderDetailsResponses = await Promise.all(orderDetailsPromises);
      const ordersWithDetails = orders.map((order, index) => ({
        ...order,
        CustomerName: orderDetailsResponses[index].data.CustomerName,
        Phone: orderDetailsResponses[index].data.Phone,
      }));

      return ordersWithDetails;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  };

  const fetchOrderHistory = async () => {
    setLoading(true); // Start loading indicator
    try {
      const data = await getOrderHistory();
      const formattedData = data.map(order => ({
        id: order.OrderID,
        date: order.OrderDate,
        status: order.Status,
        amount: order.TotalPrice,
        customerName: order.CustomerName,
        phone: order.Phone
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
    fetchOrderHistory();
  }, [sortOrder]);

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
              <Button danger className="w-36 mr-2" onClick={() => showConfirm(record.id, 'Canceled')}>
                Cancel
              </Button>
            </div>
          );
        case 'Delivering':
          return (
            <Button type="primary" className="w-36 mr-2" onClick={() => showConfirm(record.id, 'Shipped')}>
              Shipped
            </Button>
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
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/order-history-detail/${record.id}`)}>{record.id}</Button>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <Text>{moment(record.date).format('DD/MM/YYYY HH:mm')}</Text> // Format date using moment.js
      ),
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
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
      title: 'Cập nhật trạng thái',
      key: 'updateStatus',
      render: (text, record) => renderUpdateButton(record),
    },
  ].filter(col => col.key !== 'updateStatus' || role === 'Sales Staff'); // Filter out 'updateStatus' column if not Sales Staff

  const filteredOrders = orders.filter(order => 
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout style={{ minHeight: '80vh' }}>
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          <h2 className="text-5xl text-center font-semibold mb-4">Danh sách đặt hàng</h2>
          <Layout className="flex flex-row justify-between">
            <Button onClick={handleSortOrder} className="mb-4">
              Sort by date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </Button>
            <Search
              placeholder="Search by customer name or phone"
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: 16, width: 300 }}
            />
          </Layout>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredOrders}
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
