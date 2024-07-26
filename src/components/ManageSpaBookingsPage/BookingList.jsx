/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, message, Spin, Modal, Input, DatePicker, Tabs, Tag, Timeline, Select, Radio } from "antd";
import axios from 'axios';
import moment from "moment";
import { useTranslation } from 'react-i18next';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Item: TimelineItem } = Timeline;
const API_URL = import.meta.env.REACT_APP_API_URL;
const PAYPAL_CLIENT_ID = import.meta.env.REACT_APP_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = import.meta.env.REACT_APP_PAYPAL_CLIENT_SECRET;
const REACT_APP_EXCHANGE_RATE_API = import.meta.env.REACT_APP_EXCHANGE_RATE_API;

const SpaBooking = () => {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("role") || "Guest");
  const [spaBookings, setSpaBookings] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sortOrder] = useState('desc');
  const [filteredSpaBookings, setFilteredSpaBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [exchangeRateVNDtoUSD, setExchangeRateVNDtoUSD] = useState(null)
  const [bookingCount, setBookingCount] = useState({
    all: 0,
    completed: 0,
    pending: 0,
    checkedin: 0,
    canceled: 0,
  });
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingDate, setSelectedBookingDate] = useState(null);
  const [selectedDateCreated, setSelectedDateCreated] = useState(null);
  const [caretakers, setCaretakers] = useState([]); 
  const [selectedCaretaker, setSelectedCaretaker] = useState(null);
  const [caretakerID, setCaretakerID] = useState(''); 
  const [caretakerNote, setCaretakerNote] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null); // State to hold selected booking details
  const [selectedReason, setSelectedReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [selectedCancelSource, setSelectedCancelSource] = useState('');

  // Function to get spa bookings
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

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${REACT_APP_EXCHANGE_RATE_API}/latest/VND`);
        setExchangeRateVNDtoUSD(response.data.conversion_rates.USD);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        message.error("Error fetching exchange rate.");
      }
    };

    fetchExchangeRate();
  }, []);

  // Function to get spa booking details
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

  // Fetch spa bookings on component mount and when activeTab or sortOrder changes
  useEffect(() => {
    if (role === 'Customer' || role === 'Guest') {
      navigate('/')
    } else {
      fetchSpaBookings();
    }
  }, [activeTab, sortOrder]);

  // Filter spa bookings based on search query and date filters
  useEffect(() => {
    let filteredData = spaBookings.filter(booking =>
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery)
    );
    // Filter booking date
    if (selectedBookingDate) {
      filteredData = filteredData.filter(booking =>
        moment(booking.bookingDate).isSame(selectedBookingDate, 'day')
      );
    }
    // Filter date created
    if (selectedDateCreated) {
      filteredData = filteredData.filter(booking =>
        moment(booking.date).isSame(selectedDateCreated, 'day')
      );
    }

    setFilteredSpaBookings(filteredData);
  }, [searchQuery, spaBookings, selectedBookingDate, selectedDateCreated]);



  // Fetch spa bookings and update booking counts
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
          status: booking.CurrentStatus,
          reviewed: booking.Reviewed,
          customerName: detail.CustomerName,
          phone: detail.Phone,
          bookingDate: detail.BookingDate,
          bookingTime: detail.BookingTime,
          statusChanges: booking.StatusChanges,
          CaretakerNote: booking.CaretakerNote,
          CaretakerID: booking.CaretakerID,
          CancelReason: booking.CancelReason,
          PaypalOrderID: booking.PaypalOrderID,
          CustomerID: booking.AccountID
        };
      }));
      const sortedData = sortOrder === 'desc'
        ? formattedData.sort((a, b) => b.date - a.date)
        : formattedData.sort((a, b) => a.date - b.date);

      setBookingCount({
        all: sortedData.length,
        completed: sortedData.filter(booking => booking.status === 'Completed').length,
        pending: sortedData.filter(booking => booking.status === 'Pending').length,
        checkedin: sortedData.filter(booking => booking.status === 'Checked In').length,
        canceled: sortedData.filter(booking => booking.status === 'Canceled').length,
      });

      const filteredData = activeTab === 'all'
        ? sortedData
        : sortedData.filter(booking => booking.status.toLowerCase() === activeTab);

      setSpaBookings(filteredData);
    } catch (error) {
      console.error('Error fetching spa bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setSaving(true)
    if (pendingStatus === 'Checked In' && !selectedCaretaker) {
      message.error(t('Please select a caretaker before confirming the check-in status.'));
      return;
    }

    // Determine cancel reason
    let cancelReason = '';
    if (pendingStatus === 'Canceled') {
      setCaretakerNote('')
      setCaretakerID('')
      if (selectedCancelSource === 'Khach') {
        cancelReason = selectedReason;
        if (selectedReason === 'Khac') {
          cancelReason = reasonDetail;
        }
      } else if (selectedCancelSource === 'Tiem') {
        if (selectedReason === 'Khac') {
          cancelReason = reasonDetail; 
        }
      }
      await processRefund(selectedBooking.PaypalOrderID, selectedBooking.TotalPrice);
    }

    try {
      const token = localStorage.getItem('token');
      const updatedStatusChanges = [
        ...selectedBooking.statusChanges, 
        {
          Status: pendingStatus, 
          ChangeTime: new Date().toISOString(), 
        },
      ];
  
      await axios.put(
        `${API_URL}/api/Spa-bookings/${selectedBookingId}`,
        {
          Status: pendingStatus, 
          StatusChanges: updatedStatusChanges,
          CaretakerID: caretakerID,
          CaretakerNote: caretakerNote,
          CancelReason: cancelReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      
      // If the status is "Completed", call the update-spent API
      if (pendingStatus === 'Completed') {
        await axios.patch(
          `${API_URL}/api/accounts/${selectedBooking.CustomerID}/update-spent`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
  
      // Show success message
      message.success(`${t('booking_success_update_to')} "${pendingStatus}"`);
      setSaving(false); // End saving process
      setReasonDetail('')
      setSelectedCancelSource('')
      setSelectedReason('')
      setUpdateStatusModalVisible(false); // Close modal
      fetchSpaBookings(); // Refresh bookings after update
    } catch (error) {
      // Handle error
      console.error('Error updating booking status:', error);
      message.error(t('fail_update_status'));
      setSaving(false); // End saving process
    }
  };

  // Process refund via PayPal
  const processRefund = async (paypalOrderID, TotalPrice) => {
    try {
      let refundPercentage = 100; // Default refund percentage
      if (selectedCancelSource === 'Khach') {
        if (selectedReason === 'Khách không đến tiệm để làm dịch vụ') {
          refundPercentage = 60;
        } else {refundPercentage = 100}
      } else if (selectedCancelSource === 'Tiem') {
        refundPercentage = 100;
      }
      
      const refundAmount = (TotalPrice * refundPercentage) / 100 * exchangeRateVNDtoUSD;

      const accessToken = await getPaypalAccessToken();

      // Process refund request
      const response = await axios.post(
        `https://api-m.sandbox.paypal.com/v2/payments/captures/${paypalOrderID}/refund`,
        {
          amount: {
            value: refundAmount.toFixed(2), 
            currency_code: 'USD'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.status === 201) {
        // Show success message with modal
        Modal.success({
          title: t('refund_success_title'),
          content: t('refund_success_content'),
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} className="text-center" />,
        });
      } else {
        throw new Error('Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      // Show error message with modal
      Modal.error({
        title: t('refund_error_title'),
        content: t('refund_error_content'),
      });
    }
  };

  // Get PayPal access token
  const getPaypalAccessToken = async () => {
    try {
      const response = await axios.post(
        'https://api-m.sandbox.paypal.com/v1/oauth2/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw new Error('Failed to get PayPal access token');
    }
  };
  
  // Fetch Caretaker Staff accounts and check for availability
  useEffect(() => {
    if(!selectedBooking){
      return;
    }
    const fetchAccountsAndCheckAvailability = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch all caretakers
        const response = await axios.get(`${API_URL}/api/accounts/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const caretakers = response.data.accounts
          .filter((account) => account.role === 'Caretaker Staff')
          .map((account) => ({
            id: account.AccountID,
            name: account.fullname,
          }));

        // Fetch all spa bookings for availability check
        const bookingsResponse = await axios.get(`${API_URL}/api/Spa-bookings/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Extract CaretakerID and BookingID from SpaBookings
        const spaBookings = bookingsResponse.data.map((booking) => ({
          caretakerID: booking.CaretakerID,
          bookingID: booking.BookingID,
          status: booking.CurrentStatus,
        }));
        // Fetch booking details for each booking to check availability
        const bookingDetailsResponse = await Promise.all(
          spaBookings.map((booking) =>
            axios.get(`${API_URL}/api/spa-booking-details/booking/${booking.bookingID}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).then((response) => ({
              bookingID: booking.bookingID,
              caretakerID: booking.caretakerID,
              bookingDate: moment(response.data.BookingDate).format('YYYY-MM-DD'),
              bookingTime: moment(response.data.BookingTime, 'HH:mm').format('HH:mm'),
              status: booking.status,
            }))
          )
        );
        // Filter out the selectedBooking from the bookingDetailsResponse
        const filteredBookingDetails = bookingDetailsResponse.filter(
          (bookingDetail) =>
            bookingDetail.bookingID !== selectedBooking?.id
        );
        // Map caretakers with availability status
        const updatedCaretakers = caretakers.map((caretaker) => {
          // Check if this caretaker is booked for the same date and time slot
          const isBusy = filteredBookingDetails.some((bookingDetail) => {
            return (
              bookingDetail.caretakerID === caretaker.id &&
              bookingDetail.bookingDate === selectedBooking?.bookingDate &&
              bookingDetail.bookingTime === selectedBooking?.bookingTime &&
              bookingDetail.status === 'Checked In' &&
              bookingDetail.bookingID !== selectedBooking?.id // Ignore current booking
            );
          });

          return {
            ...caretaker,
            isBusy,
          };
        });

        setCaretakers(updatedCaretakers);

        console.log('Updated Caretakers with Availability:', updatedCaretakers); // Debugging
      } catch (error) {
        console.error('Error fetching accounts or checking availability:', error);
      }
    };

    fetchAccountsAndCheckAvailability();
  }, [selectedBooking]);

  const handleCaretakerChange = (value) => {
    const selectedCaretaker = caretakers.find(caretaker => caretaker.id === value);
    setSelectedCaretaker(selectedCaretaker);
    setCaretakerID(value);
    setCaretakerNote(selectedCaretaker ? selectedCaretaker.name : '');
  };

  const renderActions = (record) => {
    if (role === 'Sales Staff') {
      if (record.status === 'Pending') {
        return (
          <>
            <Button type="primary" className="min-w-[100px] w-auto px-2 py-1 text-center mr-2 text-xl" onClick={() => showUpdateStatusModal(record.id, 'Checked In')}>{t('Checked In')}</Button>
            <Button danger className="min-w-[100px] w-auto px-2 py-1 text-center text-xl" onClick={() => showUpdateStatusModal(record.id, 'Canceled')}>{t('cancel')}</Button>
          </>
        );
      }
    }
    if (role === 'Caretaker Staff') {
      if (record.status === 'Checked In') {
        return (
          <>
            <Button type="primary" className="min-w-[100px] w-auto px-2 py-1 text-center mr-2 text-xl" onClick={() => showUpdateStatusModal(record.id, 'Completed')}>{t('completed')}</Button>
            <Button danger className="min-w-[100px] w-auto px-2 py-1 text-center text-xl" onClick={() => showUpdateStatusModal(record.id, 'Canceled')}>{t('cancel')}</Button>
          </>
        );
      }
    }
    return null;
  };

  // Define table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      className: 'sticky left-0 bg-white',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/spa-booking-detail/${record.id}`)}>{record.id}</Button>
      ),
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
      render: (text, record) => (
        <Text>{moment(record.date).format('DD/MM/YYYY HH:mm')}</Text>
      ),
    },
    {
      title: t('booking_date'),
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
        <Tag className='min-w-[70px] w-auto px-2 py-1 text-center' color={record.status === 'Completed' ? 
          'green' : record.status === 'Pending' ? 
          'yellow' : record.status === 'Checked In' ? 
          'blue' : 'red'}>
          {record.status}
        </Tag>
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
  ].filter(col => col.key !== 'actions' || role === 'Caretaker Staff' || role === 'Sales Staff');

  // Show modal to update status and capture current booking details
  const showUpdateStatusModal = (id, status) => {
    const booking = spaBookings.find(booking => booking.id === id);
    setSelectedBooking(booking);
    setSelectedBookingId(id);
    setPendingStatus(status);
    setUpdateStatusModalVisible(true);
  };

  // Handle search input
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Handle booking date filter change
  const handleBookingDateChange = (date) => {
    if (date) {
      setSelectedBookingDate(date.toDate());
    } else {
      setSelectedBookingDate(null);
    }
  };

  // Handle created date filter change
  const handleDateCreatedChange = (date) => {
    if (date) {
      setSelectedDateCreated(date.toDate());
    } else {
      setSelectedDateCreated(null);
    }
  };

  const handleTextareaChange = e => {
    setReasonDetail(e.target.value);
  };

  const handleCancelConfirm = () => {
    setUpdateStatusModalVisible(false)
    setSelectedCancelSource('')
    setSelectedReason('')
    setReasonDetail('')
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout className="site-layout">
        <div className="site-layout-background" style={{ padding: 24 }}>
        <Title className="text-5xl text-center font-semibold">{t('service_list')}</Title>
        {/* Search and filter */}
        <Layout className="flex lg:flex-row sm:flex-col justify-between mt-10 mb-4 lg:items-end">
          <div>
            <Text className="mr-1">{t('filter_booking_date')}</Text>
            <DatePicker
              onChange={handleBookingDateChange}
              style={{ width: 150, marginRight: 12 }}
            />
          </div>
          <div>
            <Text className="mr-1">{t('filter_created_date')}</Text>
            <DatePicker
              onChange={handleDateCreatedChange}
              style={{ width: 150, marginRight: 12 }}
            />
          </div>
          <div className="flex md:justify-end items-center">
            <Text className="mr-1">{t('search_customer')}:</Text>
            <Search
              placeholder={t('search')}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 340 }}
            />
          </div>
        </Layout>
        {/* Table */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={<span>{t('all')} <span className="inline-block bg-gray-200 text-gray-800 text-md font-semibold px-3 py-1 w-11 h-11 text-center">{bookingCount.all}</span></span>} key="all" />
            <TabPane tab={<span>{t('completed')} <span className="inline-block bg-green-200 text-green-800 text-md font-semibold px-3 py-1 w-11 h-11 text-center">{bookingCount.completed}</span></span>} key="completed" />
            <TabPane tab={<span>{t('pending')} <span className="inline-block bg-yellow-200 text-yellow-800 text-md font-semibold px-3 py-1 w-11 h-11 text-center">{bookingCount.pending}</span></span>} key="pending" />
            <TabPane tab={<span>{t('Checked In')} <span className="inline-block bg-blue-200 text-blue-800 text-md font-semibold px-3 py-1 w-11 h-11 text-center">{bookingCount.checkedin}</span></span>} key="checked in" />
            <TabPane tab={<span>{t('canceled')} <span className="inline-block bg-red-200 text-red-800 text-md font-semibold px-3 py-1 w-11 h-11 text-center">{bookingCount.canceled}</span></span>} key="canceled" />
          </Tabs>
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
            footer={[
              <Button 
                key="cancel" 
                onClick={handleCancelConfirm} 
                disabled={saving}
              >
                {t('cancel')}
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={handleUpdateStatus}
                disabled={saving || (pendingStatus === 'Checked In' && !selectedCaretaker) || (pendingStatus === 'Canceled' && (!selectedCancelSource ||!selectedReason))} // Disable the submit button during saving
              >
                {t('confirm')}
              </Button>
            ]}
          >
            <p>{t('ask_update')} "{pendingStatus}"?</p>
            {pendingStatus === 'Checked In' && (
              <div className="mb-4">
                <Text className="mr-1">{t('Nhân viên được yêu cầu: ')} {selectedBooking?.CaretakerNote || '-'}</Text><br/>
                <Text className="mr-1">{t('Chọn nhân viên chăm sóc: ')}</Text>
                <Select
                  placeholder={t('select_caretaker')}
                  onChange={handleCaretakerChange}
                  style={{ width: 200 }}
                >
                  {caretakers.map(caretaker => (
                    <Option key={caretaker.id} 
                            value={caretaker.id} 
                            disabled={caretaker.isBusy}>
                      {caretaker.name}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
            {pendingStatus === 'Canceled' && (
              <div className="mb-4">
                <p className="mb-2">{t('Lý do hủy từ:')}</p>
                <Radio.Group onChange={e => {
                  setSelectedCancelSource(e.target.value);
                  setSelectedReason('');
                }} value={selectedCancelSource}>
                  <Radio value="Khach">{t('Khách')}</Radio>
                  <Radio value="Tiem">{t('Tiệm')}</Radio>
                </Radio.Group>
                <div className="mt-2">
                  {selectedCancelSource === 'Khach' && (
                    <Select
                      placeholder={t('Chọn lý do')}
                      onChange={value => {
                        setSelectedReason(value);
                        if (value !== 'Khac') {
                          setSelectedReason(value);
                        }
                      }}
                      className="w-full"
                    >
                      <Option value="Khách không đến tiệm để làm dịch vụ">{t('Khách không đến tiệm để làm dịch vụ')}</Option>
                      <Option value="Khách liên hệ hủy lịch do sự cố đặt nhầm hoặc không còn nhu cầu nữa">{t('Khách liên hệ hủy lịch do sự cố đặt nhầm hoặc không còn nhu cầu nữa')}</Option>
                      <Option value="Khac">{t('Khác')}</Option>
                    </Select>
                  )}
                  {selectedCancelSource === 'Tiem' && (
                    <Select
                      placeholder={t('Chọn lý do')}
                      onChange={value => {
                        setSelectedReason(value);
                      }}
                      className="w-full"
                    >
                      <Option value="Khac">{t('Khác')}</Option>
                    </Select>
                  )}
                  {selectedReason === 'Khac' && (
                    <textarea
                      placeholder={t('Nhập lý do khác')}
                      onChange={handleTextareaChange}
                      required
                      style={{ width: '100%', marginTop: '8px' }}
                    />
                  )}
                </div>
              </div>
            )}
            <Timeline>
              {selectedBooking?.statusChanges.map((change, index) => (
                <TimelineItem key={index} color={getStatusColor(change.Status)}>
                  <Text strong>{change.Status}</Text> - <Text>{moment(change.ChangeTime).format('DD/MM/YYYY HH:mm')}</Text>
                </TimelineItem>
              ))}
            </Timeline>
          </Modal>

        </div>
      </Layout>
    </Layout>
  );
};

// Function to map status to color
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'orange';
    case 'Checked In':
      return 'blue';
    case 'Completed':
      return 'green';
    case 'Canceled':
      return 'red';
    default:
      return 'gray';
  }
};

export default SpaBooking;
