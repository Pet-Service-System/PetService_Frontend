/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, message, Spin, Modal, Input, DatePicker } from "antd";
import axios from 'axios';
import moment from "moment";

const { Text } = Typography;
const { Search } = Input;

const getSpaBookings = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/Spa-bookings/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching spa bookings:', error);
    throw error;
  }
};

const getSpaBookingDetail = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/spa-booking-details/booking/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching spa booking detail:', error);
    throw error;
  }
};

const SpaBooking = () => {
  const navigate = useNavigate();
  const [spaBookings, setSpaBookings] = useState([]);
  const [filteredSpaBookings, setFilteredSpaBookings] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [role] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false);
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date filter

  useEffect(() => {
    fetchSpaBookings();
  }, [sortOrder]);

  useEffect(() => {
    // Filter spaBookings based on searchQuery and selectedDate
    let filteredData = spaBookings.filter(booking =>
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery)
    );

    if (selectedDate) {
      filteredData = filteredData.filter(booking =>
        moment(booking.date).isSame(selectedDate, 'day')
      );
    }

    setFilteredSpaBookings(filteredData);
  }, [searchQuery, spaBookings, selectedDate]);

  const fetchSpaBookings = async () => {
    setLoading(true);
    try {
      const data = await getSpaBookings();
      const formattedData = await Promise.all(data.map(async (booking) => {
        const detail = await getSpaBookingDetail(booking.BookingID);
        return {
          id: booking.BookingID,
          date: new Date(booking.CreateDate),
          TotalPrice: booking.TotalPrice,
          status: booking.Status,
          reviewed: booking.Reviewed,
          customerName: detail.CustomerName,
          phone: detail.Phone,
        };
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

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3001/api/Spa-bookings/${selectedBookingId}`,
        { Status: pendingStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success(`Booking status updated successfully to "${pendingStatus}"`);
      setUpdateStatusModalVisible(false);
      fetchSpaBookings(); // Refresh bookings after update
    } catch (error) {
      console.error('Error updating booking status:', error);
      message.error('Failed to update booking status');
    }
  };

  const renderActions = (record) => {
    if (role === 'Sales Staff') {
      if (record.status === 'Pending') {
        return (
          <>
            <Button type="primary" className="mr-2 w-40" onClick={() => showUpdateStatusModal(record.id, 'Processing')}>Processing</Button>
            <Button danger className="w-40" onClick={() => showUpdateStatusModal(record.id, 'Canceled')}>Cancel</Button>
          </>
        );
      } else if (record.status === 'Processing') {
        return (
          <>
            <Button type="primary" className="mr-2 w-40" onClick={() => showUpdateStatusModal(record.id, 'Completed')}>Completed</Button>
            <Button danger className="w-40" onClick={() => showUpdateStatusModal(record.id, 'Canceled')}>Cancel</Button>
          </>
        );
      }
    }
    return null;
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
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => renderActions(record),
    },
  ].filter(col => col.key !== 'actions' || role === 'Sales Staff');

  const showUpdateStatusModal = (id, status) => {
    setSelectedBookingId(id);
    setPendingStatus(status);
    setUpdateStatusModalVisible(true);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date.toDate());
    } else {
      setSelectedDate(null);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24 }}>
          <h2 className="text-5xl text-center font-semibold mb-4">Spa Service Booking History</h2>
          <Layout className="flex flex-row justify-between mb-4">
            <Button onClick={handleSortOrder}>
              Sort by date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </Button>
            <DatePicker
              onChange={handleDateChange}
              style={{ width: 200 }}
            />
            <Search
              placeholder="Search by customer name or phone"
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
          </Layout>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredSpaBookings}
              rowKey="id"
              scroll={{ x: '100%' }}
            />
          </Spin>
          <Modal
            title={`Update Status (${pendingStatus})`}
            visible={updateStatusModalVisible}
            onCancel={() => setUpdateStatusModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setUpdateStatusModalVisible(false)}>Cancel</Button>,
              <Button key="submit" type="primary" onClick={handleUpdateStatus}>Confirm</Button>,
            ]}
          >
            <p>Are you sure you want to update the status to "{pendingStatus}"?</p>
          </Modal>
        </div>
      </Layout>
    </Layout>
  );
};

export default SpaBooking;
