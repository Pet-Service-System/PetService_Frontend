import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, Spin, message, Modal, Input, DatePicker, Tabs, Tag } from "antd";
import axios from 'axios';
import moment from "moment";
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;
const { confirm } = Modal;
const { Search } = Input;
const API_URL = import.meta.env.REACT_APP_API_URL;
const { TabPane } = Tabs;

const OrderList = () => {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("role") || "Guest");
  if(role === 'Customer' || role === 'Guest'){
    navigate('/')
  }
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); 
  const [sortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date filter
  const [confirmLoading, setConfirmLoading] = useState(false); // State to track modal loading state
  const [filteredOrderByDate, setFilteredOrderByDate] = useState([]);
  const { t } = useTranslation();
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
      const response = await axios.get(`${API_URL}/api/orders/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orders = response.data;

      const sanitizedData = orders.map(order => ({
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

      // Fetch order details for each order
      const orderDetailsPromises = orders.map(order =>
        axios.get(`${API_URL}/api/order-details/order/${order.OrderID}`, {
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

  useEffect(() => {
    // Filter spaBookings based on searchQuery and selectedDate
    let filteredData = orders.filter(booking =>
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery)
    );

    if (selectedDate) {
      filteredData = filteredData.filter(booking =>
        moment(booking.date).isSame(selectedDate, 'day')
      );
    }

    setFilteredOrderByDate(filteredData);
  }, [searchQuery, orders, selectedDate]);

  const showConfirm = (orderId, newStatus) => {
    confirm({
      title: t('inform_update'),
      content: `Change status to "${newStatus}"?`,
      confirmLoading: confirmLoading, // Pass confirmLoading state to modal
      onOk() {
        handleUpdateStatus(orderId, newStatus);
      },
      onCancel() {
        console.log('Cancelled');
      },
    });
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setConfirmLoading(true); // Set confirm loading state to true
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API_URL}/api/orders/${orderId}`,
        { Status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success(t('updated_successfully'));
      fetchOrderHistory(); // Refresh order list after update
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    } finally {
      setConfirmLoading(false); // Reset confirm loading state
    }
  };

  const renderUpdateButton = (record) => {
    if (role === 'Sales Staff') {
      switch (record.status) {
        case 'Processing':
          return (
            <div>
              <Button type="primary" className="min-w-[100px] w-auto px-2 py-1 text-center mr-2 text-xl" onClick={() => showConfirm(record.id, 'Delivering')} disabled={confirmLoading}>
                {t('delivering')}
              </Button>
              <Button danger className="min-w-[100px] w-auto px-2 py-1 text-center text-xl" onClick={() => showConfirm(record.id, 'Canceled')} disabled={confirmLoading}>
                {t('cancel')}
              </Button>
            </div>
          );
        case 'Delivering':
          return (
            <Button
              className="min-w-[100px] text-white w-auto px-2 py-1 text-center mr-2 bg-green-500 hover:bg-green-600 text-xl" 
              onClick={() => showConfirm(record.id, 'Shipped')}
              disabled={confirmLoading}
            >
              {t('delivered')}
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
        <Text>{moment(record.date).format('DD/MM/YYYY HH:mm')}</Text> // Format date using moment.js
      ),
    },
    {
      title: t('customer_name'),
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: t('phone'),
      dataIndex: 'phone',
      key: 'phone',
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
        <Tag className='min-w-[70px] w-auto px-2 py-1 text-center' color={record.status === 'Shipped' ? 
                  'green' : record.status === 'Pending' ? 
                  'orange' : record.status === 'Processing' ? 
                  'blue' : 'red'}>
        {record.status}
        </Tag>
      )
    },
    {
      title: t('update_status'),
      key: 'updateStatus',
      render: (text, record) => renderUpdateButton(record),
    },
  ].filter(col => col.key !== 'updateStatus' || role === 'Sales Staff'); // Filter out 'updateStatus' column if not Sales Staff

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date.toDate());
    } else {
      setSelectedDate(null);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  return (
    <Layout style={{ minHeight: '80vh' }}>
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          <Title className="text-5xl text-center font-semibold">{t('ordered_list')}</Title>
          {/* Search and filter */}
          <Layout className="flex lg:flex-row sm:flex-col justify-between mt-10 mb-4 lg:items-end">
            <div>
              <Text className="mr-1">{t('filter_order_date')}:</Text> {/* Chỉnh sửa key dịch nếu cần thiết */}
              <DatePicker
                onChange={handleDateChange}
                style={{ width: 200 }}
              />
            </div>
            <div className="flex md:justify-end items-center">
              <Text className="mr-1">{t('search_customer')}:</Text>
              <Search
                placeholder={t('search_by_customer')}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 300 }}
              />
            </div>
          </Layout>
          {/* Table */}
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
              dataSource={filteredOrderByDate}
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
