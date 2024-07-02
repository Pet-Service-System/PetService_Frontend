/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, message, Spin, Modal, Input, DatePicker } from "antd";
import axios from 'axios';
import moment from "moment";
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;
const { Search } = Input;


const SpaBooking = () => {  
  const navigate = useNavigate();
  const [spaBookings, setSpaBookings] = useState([]);
  const [saving, setSaving] = useState(false);
  const [filteredSpaBookings, setFilteredSpaBookings] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [role] = useState(localStorage.getItem('role') || 'Guest');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const getSpaBookings = async (bookingDate, dateCreated) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:3001/api/Spa-bookings/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          bookingDate: bookingDate ? moment(bookingDate).format('YYYY-MM-DD') : undefined,
          dateCreated: dateCreated ? moment(dateCreated).format('YYYY-MM-DD') : undefined,
        }
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

  // State for status update modal
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingDate, setSelectedBookingDate] = useState(null); // State for selected booking date filter
  const [selectedDateCreated, setSelectedDateCreated] = useState(null); // State for selected date created filter

  useEffect(() => {
    fetchSpaBookings();
  }, [sortOrder, selectedBookingDate, selectedDateCreated]);

  useEffect(() => {
    // Filter spaBookings based on searchQuery and selectedDate
    let filteredData = spaBookings.filter(booking =>
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery)
    );

    if (selectedBookingDate) {
      filteredData = filteredData.filter(booking =>
        moment(booking.bookingDate).isSame(selectedBookingDate, 'day')
      );
    }

    if (selectedDateCreated) {
      filteredData = filteredData.filter(booking =>
        moment(booking.date).isSame(selectedDateCreated, 'day')
      );
    }

    setFilteredSpaBookings(filteredData);
  }, [searchQuery, spaBookings, selectedBookingDate, selectedDateCreated]);

  const fetchSpaBookings = async () => {
    setLoading(true);
    try {
      const data = await getSpaBookings(selectedBookingDate, selectedDateCreated);
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
          bookingDate: detail.BookingDate ? new Date(detail.BookingDate) : null,
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
      setSaving(true)
      await axios.put(
        `http://localhost:3001/api/Spa-bookings/${selectedBookingId}`,
        { Status: pendingStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success(`${t('booking_success_update_to')} "${pendingStatus}"`);
      setSaving(false)
      setUpdateStatusModalVisible(false);
      fetchSpaBookings(); // Refresh bookings after update
    } catch (error) {
      console.error('Error updating booking status:', error);
      message.error(t('fail_update_status'));
      setSaving(false)
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
        <Text>{moment(record.date).format('DD/MM/YYYY HH:mm')}</Text>
      ),
    },
    {
      title: 'Booking Date',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (text, record) => (
        <Text>{record.bookingDate ? moment(record.bookingDate).format('DD/MM/YYYY') : '-'}</Text>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Text className={
          record.status === 'Completed' ? 'text-green-600' :
            record.status === 'Pending' ? 'text-yellow-500' :
            record.status === 'Processing' ? 'text-orange-600' :
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

  const handleBookingDateChange = (date) => {
    if (date) {
      setSelectedBookingDate(date.toDate());
    } else {
      setSelectedBookingDate(null);
    }
  };

  const handleDateCreatedChange = (date) => {
    if (date) {
      setSelectedDateCreated(date.toDate());
    } else {
      setSelectedDateCreated(null);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24 }}>
          <Title className="text-5xl text-center font-semibold">Danh sách dịch vụ</Title>
          <Layout className="flex lg:flex-row sm:flex-col justify-between mt-10 mb-4">
            <Button onClick={handleSortOrder} style={{ width: 170 }}>
              Sort by date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </Button>
            <div>
              <Text>Lọc theo ngày đặt lịch: </Text>
              <DatePicker
                onChange={handleBookingDateChange}
                style={{ width: 200, marginRight: 12 }}
              />
            </div>
            <div>
              <Text>Lọc theo ngày tạo lịch: </Text>
              <DatePicker
                onChange={handleDateCreatedChange}
                style={{ width: 200, marginRight: 12 }}
              />
            </div>
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
            title={`${t('update_status')} (${pendingStatus})`}
            visible={updateStatusModalVisible}
            onCancel={() => setUpdateStatusModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setUpdateStatusModalVisible(false)} disabled={saving}>{t('cancel')}</Button>,
              <Button key="submit" type="primary" onClick={handleUpdateStatus} disabled={saving}>{t('confirm')}</Button>,
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
