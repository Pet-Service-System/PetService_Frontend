/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, message, Spin, Modal, Input, DatePicker, Select } from "antd";
import axios from 'axios';
import moment from "moment";
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const API_URL = import.meta.env.REACT_APP_API_URL;


const SpaBooking = () => {  
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("role") || "Guest");
  if(role === 'Customer' || role === 'Guest'){
    navigate('/')
  }
  const [spaBookings, setSpaBookings] = useState([]);
  const [saving, setSaving] = useState(false);
  const [filteredSpaBookings, setFilteredSpaBookings] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingDate, setSelectedBookingDate] = useState(null);
  const [selectedDateCreated, setSelectedDateCreated] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  const getSpaBookings = async (bookingDate, dateCreated) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/Spa-bookings/`, {
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
      const response = await axios.get(`${API_URL}/api/spa-booking-details/booking/${id}`, {
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

  useEffect(() => {
    fetchSpaBookings();
  }, [sortOrder, selectedBookingDate, selectedDateCreated, selectedStatusFilter]);

  useEffect(() => {
    let filteredData = spaBookings.filter(booking =>
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery)
    );
    // filter booking date
    if (selectedBookingDate) {
      filteredData = filteredData.filter(booking =>
        moment(booking.bookingDate).isSame(selectedBookingDate, 'day')
      );
    }
    // filter date created
    if (selectedDateCreated) {
      filteredData = filteredData.filter(booking =>
        moment(booking.date).isSame(selectedDateCreated, 'day')
      );
    }
    // filter status
    if (selectedStatusFilter) {
      filteredData = filteredData.filter(booking =>
        booking.status === selectedStatusFilter
      );
    }

    setFilteredSpaBookings(filteredData);
  }, [searchQuery, spaBookings, selectedBookingDate, selectedDateCreated, selectedStatusFilter]);

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
        `${API_URL}/api/Spa-bookings/${selectedBookingId}`,
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

  const handleStatusFilterChange = (value) => {
    setSelectedStatusFilter(value);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24 }}>
        <Title className="text-5xl text-center font-semibold">{t('service_list')}</Title>
        {/* Search and filter */}
        <Layout className="flex lg:flex-row sm:flex-col justify-between mt-10 mb-4 lg:items-end">
        <Button onClick={handleSortOrder} style={{ width: 200 }} className="mr-10">
              {t('sort_by_date')}: {sortOrder === 'desc' ? t('newest') : t('oldest')}
            </Button>
          <div>
            <Text>{t('filter_booking_date')}</Text>
            <DatePicker
              onChange={handleBookingDateChange}
              style={{ width: 150, marginRight: 12 }}
            />
          </div>
          <div>
            <Text>{t('filter_created_date')}</Text>
            <DatePicker
              onChange={handleDateCreatedChange}
              style={{ width: 150, marginRight: 12 }}
            />
          </div>
          <div>
            <Text>{t('filter_status')}</Text>
            <Select
              placeholder={t('select_status')}
              style={{ width: 200, marginRight: 12 }}
              onChange={handleStatusFilterChange}
              allowClear
            >
              <Option value="Pending">{t('pending')}</Option>
              <Option value="Processing">{t('processing')}</Option>
              <Option value="Completed">{t('completed')}</Option>
              <Option value="Canceled">{t('canceled')}</Option>
            </Select>
          </div>
          <div>
            <Text>{t('search_customer')}</Text>
            <Search
              placeholder={t('search')}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 340 }}
            />
          </div>
        </Layout>
        {/* Table */}
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredSpaBookings}
              rowKey="id"
              scroll={{ x: 'max-content' }}
            />
          </Spin>
          {/* Update status modal */}
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
