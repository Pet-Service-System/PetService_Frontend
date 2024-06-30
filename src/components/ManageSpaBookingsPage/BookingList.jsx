/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, message, Spin, Modal, Input } from "antd";
import axios from 'axios';
import moment from "moment";
import { useTranslation } from 'react-i18next';

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
  const [filteredSpaBookings, setFilteredSpaBookings] = useState([]); // State for filtered data
  const [sortOrder, setSortOrder] = useState('desc');
  const [role] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // State for status update modal
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSpaBookings();
  }, [sortOrder]);

  useEffect(() => {
    // Filter spaBookings based on searchQuery
    const filteredData = spaBookings.filter(booking =>
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery)
    );
    setFilteredSpaBookings(filteredData);
  }, [searchQuery, spaBookings]);

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
      message.success(t('booking_success_update_to')`"${pendingStatus}"`);
      setUpdateStatusModalVisible(false);
      fetchSpaBookings(); // Refresh bookings after update
    } catch (error) {
      console.error('Error updating booking status:', error);
      message.error(t('fail_update_status'));
    }
  };

  const renderActions = (record) => {
    if (role === 'Sales Staff') {
      if (record.status === 'Pending') {
        return (
          <>
            <Button type="primary" className="mr-2 w-40" onClick={() => showUpdateStatusModal(record.id, 'Processing')}>{t('processing')}</Button>
            <Button danger className="w-40" onClick={() => showUpdateStatusModal(record.id, 'Canceled')}>{t('cancel')}</Button>
          </>
        );
      } else if (record.status === 'Processing') {
        return (
          <>
            <Button type="primary" className="mr-2 w-40" onClick={() => showUpdateStatusModal(record.id, 'Completed')}>{t('completed')}</Button>
            <Button danger className="w-40" onClick={() => showUpdateStatusModal(record.id, 'Canceled')}>{t('cancel')}</Button>
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
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <Text>{moment(record.date).format('DD/MM/YYYY HH:mm')}</Text> // Format date using moment.js
      ),
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
          {record.status}
        </Text>
      )
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
      title: t('actions'),
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24 }}>
          <h2 className="text-5xl text-center font-semibold mb-4">{t('spa_service_booking_history')}</h2>
          <Layout className="flex flex-row justify-between">
            <Button onClick={handleSortOrder} className="mb-4">
              {t('sort_by_date')}: {sortOrder === 'desc' ? t('newest') : t('oldest')}
            </Button>
            <Search
              placeholder={t('search_by_customer_name_or_phone')}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ marginBottom: 16, width: 300 }}
            />
          </Layout>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredSpaBookings} // Render filtered data
              rowKey="id"
              scroll={{ x: '100%' }}
            />
          </Spin>
          <Modal
            title={t('update_status') ` (${pendingStatus})`}
            visible={updateStatusModalVisible}
            onCancel={() => setUpdateStatusModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setUpdateStatusModalVisible(false)}>{t('cancel')}</Button>,
              <Button key="submit" type="primary" onClick={handleUpdateStatus}>{t('confirm')}</Button>,
            ]}
          >
            <p>{t('ask_update')} "{pendingStatus}"?</p>
          </Modal>
        </div>
      </Layout>
    </Layout>
  );
};

export default SpaBooking;
