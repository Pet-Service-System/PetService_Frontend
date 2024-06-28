/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, message, Spin, Modal } from "antd";
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;




const getSpaBookings = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
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

const SpaBooking = () => {
  const navigate = useNavigate();
  const [spaBookings, setSpaBookings] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [role] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // State for status update modal
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');

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
        description: booking.PetName,
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
      message.success(t('booking_success_update_to') `"${pendingStatus}"`);
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
            <Button type="primary" className="mr-2 w-40" onClick={() => showUpdateStatusModal(record.id, 'Processing')}>Đang xử lý</Button>
            <Button danger className="w-40" onClick={() => showUpdateStatusModal(record.id, 'Canceled')}>{t('cancel')}</Button>
          </>
        );
      } else if (record.status === 'Processing') {
        return (
          <>
            <Button type="primary" className="mr-2 w-40" onClick={() => showUpdateStatusModal(record.id, 'Completed')}>Hoàn thành</Button>
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
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <Text>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(record.date)}</Text>
      )
    },
    {
      title:  t('description'),
      dataIndex: 'description',
      key: 'description',
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
        <Text className={` ${getStatusColor(record.status)}`}>{record.status}</Text>
      ),
    },
    {
      title: t('detail'),
      key: 'detail',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/spa-booking-detail/${record.id}`)}>{t('detail')}</Button>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (text, record) => renderActions(record),
    },
  ];

  const showUpdateStatusModal = (id, status) => {
    setSelectedBookingId(id);
    setPendingStatus(status);
    setUpdateStatusModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-500';
      case 'Processing':
        return 'text-yellow-500';
      case 'Completed':
        return 'text-green-500';
      case 'Canceled':
        return 'text-red-500';
      default:
        return '';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24 }}>
          <h2 className="text-5xl text-center font-semibold mb-4">{t('spa_history_order')}</h2>
          <Button onClick={handleSortOrder} className="mb-4">
            {t('sort_by_date')}: {sortOrder === 'desc' ? t('newest') : t('oldest')}
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
            title={`Update Status (${pendingStatus})`}
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
