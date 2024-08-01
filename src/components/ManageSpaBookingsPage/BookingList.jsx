/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Typography, Layout, message, Spin, Modal, Input, DatePicker, Tabs, Tag, Timeline, Select, Radio, InputNumber, Form } from "antd";
import axios from 'axios';
import moment from "moment";
import { useTranslation } from 'react-i18next';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Search, TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const API_URL = import.meta.env.REACT_APP_API_URL;
const PAYPAL_CLIENT_ID = import.meta.env.REACT_APP_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = import.meta.env.REACT_APP_PAYPAL_CLIENT_SECRET;
const REACT_APP_EXCHANGE_RATE_API = import.meta.env.REACT_APP_EXCHANGE_RATE_API;

const BookingList = () => {
  const navigate = useNavigate();
  const [spaBookings, setSpaBookings] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sortOrder] = useState('desc');
  const [filteredSpaBookings, setFilteredSpaBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [exchangeRateVNDtoUSD, setExchangeRateVNDtoUSD] = useState(null)
  const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(true);
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
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [actualWeight, setActualWeight] = useState(null);
  const [additionalCost, setAdditionalCost] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const accountID = user?.id
  const [radioValue, setRadioValue] = useState('Không');
  const [form] = Form.useForm();
  const [validate, setValidate] = useState(true);
  const [total, setTotal] = useState(0);

  // Function to get spa bookings
  const getSpaBookings = async (bookingDate, dateCreated) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/spa-bookings/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          bookingDate: bookingDate ? moment(bookingDate).format('DD/MM/YYYY') : undefined,
          dateCreated: dateCreated ? moment(dateCreated).format('DD/MM/YYYY') : undefined,
        }
      });
      setTotal(response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching spa bookings:', error);
      throw error;
    }
  };
  
  const getVoucherInformation = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/voucher/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  const handleWeightChange = async (value) => {
    setActualWeight(value);
    // Check weight validity
    if (value < 0 || value > 35 || value == null) {
      setValidate(false)
      form.setFields([
        {
          name: 'actualWeight',
          errors: ['Cân nặng thực tế phải nằm trong khoảng từ 0 đến 35'],
        },
      ]);
    } else {
      form.setFields([{ name: 'actualWeight', errors: [] }]);
      await calculateAdditionalCost(value);

      // Check if weight is provided when "Có" is selected
      if (radioValue === 'Có' && value === null) {
        setIsConfirmButtonDisabled(true);
      } else {
        setIsConfirmButtonDisabled(false);
      }
      setValidate(true)
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

  // // Function to get spa booking details
  // const getSpaBookingDetail = async (id) => {
  //   const token = localStorage.getItem('token');
  //   try {
  //     const response = await axios.get(`${API_URL}/api/spa-booking-details/booking/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching spa booking detail:', error);
  //     throw error;
  //   }
  // };

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
      (booking.CustomerName && booking.CustomerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.Phone && booking.Phone.includes(searchQuery))
    );
  
    // Filter booking date
    if (selectedBookingDate) {
      filteredData = filteredData.filter(booking =>
        moment(booking.BookingDate, 'DD/MM/YYYY').isSame(selectedBookingDate, 'day')
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
        return {
          id: booking._id.toString(),  // Use _id for unique identifier
          date: new Date(booking.CreateDate),
          TotalPrice: booking.TotalPrice,
          CustomerID: booking.AccountID,
          status: booking.CurrentStatus,
          isSpentUpdated: booking.isSpentUpdated,
          VoucherID: booking.VoucherID,
          CustomerName: booking.BookingDetailsID.CustomerName,
          Phone: booking.BookingDetailsID.Phone,
          PetID: booking.BookingDetailsID.PetID,
          PetName: booking.BookingDetailsID.PetName,
          PetGender: booking.BookingDetailsID.PetGender,
          PetStatus: booking.BookingDetailsID.PetStatus,
          PetTypeID: booking.BookingDetailsID.PetTypeID,
          PetWeight: booking.BookingDetailsID.PetWeight,
          ActualWeight: booking.BookingDetailsID.ActualWeight,
          PetAge: booking.BookingDetailsID.PetAge,
          BookingDate: booking.BookingDetailsID.BookingDate,
          BookingTime: booking.BookingDetailsID.BookingTime,
          ServiceID: booking.BookingDetailsID.ServiceID,
          StatusChanges: booking.StatusChanges,
          CaretakerNote: booking.AdditionalInfoID.CaretakerNote,
          CaretakerID: booking.AdditionalInfoID.CaretakerID,
          CancelReason: booking.AdditionalInfoID.CancelReason,
          Feedback: booking.AdditionalInfoID.Feedback,
          isReplied: booking.AdditionalInfoID.isReplied,
          PaypalOrderID: booking.PaymentDetailsID.PaypalOrderID,
          ExtraCharge: booking.PaymentDetailsID.ExtraCharge
        };
      }));

      // Filter based on user role
      const filteredData = role === 'Caretaker Staff'
        ? formattedData.filter(booking => booking.CaretakerID === accountID)
        : formattedData;

      const sortedData = sortOrder === 'desc'
        ? filteredData.sort((a, b) => b.date - a.date)
        : filteredData.sort((a, b) => a.date - b.date);

      setBookingCount({
        all: sortedData.length,
        completed: sortedData.filter(booking => booking.status === 'Completed').length,
        pending: sortedData.filter(booking => booking.status === 'Pending').length,
        checkedin: sortedData.filter(booking => booking.status === 'Checked In').length,
        canceled: sortedData.filter(booking => booking.status === 'Canceled').length,
      });

      const displayedData = activeTab === 'all'
        ? sortedData
        : sortedData.filter(booking => booking.status.toLowerCase() === activeTab);

      setSpaBookings(displayedData);
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
    }

    if (finalPrice === 0) {
      // Set finalPrice only if it is currently 0
      setFinalPrice(selectedBooking.TotalPrice);
    }

    try {
      const token = localStorage.getItem('token');

      if (selectedBooking.status === 'Checked In' && pendingStatus === 'Completed') {
        await axios.patch(
          `${API_URL}/api/spa-bookings/${selectedBookingId}`,
          {
            CurrentStatus: pendingStatus,
            CancelReason: cancelReason,
            ExtraCharge: selectedBooking.ExtraCharge,
            FinalPrice: selectedBooking.FinalPrice,
            isReplied: false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (selectedBooking.status === 'Pending' && pendingStatus === 'Checked In') {
        await axios.patch(
          `${API_URL}/api/spa-bookings/${selectedBookingId}`,
          {
            CurrentStatus: pendingStatus,
            CaretakerID: selectedCaretaker ? selectedCaretaker.id : selectedBooking.CaretakerID,
            CaretakerNote: selectedCaretaker ? selectedCaretaker.name : selectedBooking.CaretakerNote,
            ExtraCharge: additionalCost,
            TotalPrice: finalPrice,
            isReplied: false,
            ActualWeight: actualWeight,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
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

      if (selectedBooking.status == 'Pending' && pendingStatus === 'Canceled') {
        await axios.patch(
          `${API_URL}/api/spa-bookings/${selectedBookingId}`,
          {
            CurrentStatus: pendingStatus,
            CancelReason: cancelReason,
            isReplied: false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        await processRefund(selectedBooking.PaypalOrderID, selectedBooking.TotalPrice);
      }
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

      if (selectedBooking.status == 'Checked In' && pendingStatus === 'Canceled') {
        await axios.patch(
          `${API_URL}/api/spa-bookings/${selectedBookingId}`,
          {
            CurrentStatus: pendingStatus,
            CancelReason: cancelReason,
            isReplied: false,
          },
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
      setSelectedCaretaker(null);
      setSelectedCancelSource('')
      setShowWeightInput(false)
      setRadioValue('Không');
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
          refundPercentage = 30;
        } else if (selectedReason === 'Khách liên hệ hủy lịch do sự cố hoặc không còn nhu cầu nữa') {
          refundPercentage = 100;
        } else if (selectedReason === 'Khách hủy lịch sau khi phát sinh chi phí') {
          refundPercentage = 70;
        } else if (selectedReason === 'Thú cưng không hợp tác') {
          refundPercentage = 90;
        } else { refundPercentage = 0 }
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

      // if (response.status === 201 && refundPercentage != 0) {
      //   // Show success message with modal
      //   Modal.success({
      //     title: t('refund_success_title'),
      //     content: t('refund_success_content'),
      //     icon: <CheckCircleOutlined style={{ color: '#52c41a' }} className="text-center" />,
      //   });
      // } else {
      //   throw new Error('Failed to process refund');
      // }
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
    if (!selectedBooking) {
      return;
    }
  
    const fetchAccountsAndCheckAvailability = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all caretakers
        const accountsResponse = await axios.get(`${API_URL}/api/accounts/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        const caretakers = accountsResponse.data.accounts
          .filter((account) => account.role === 'Caretaker Staff')
          .map((account) => ({
            id: account.AccountID,
            name: account.fullname,
          }));
  
        // Fetch all spa bookings
        const bookingsResponse = await axios.get(`${API_URL}/api/spa-bookings/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Extract relevant data for availability check
        const spaBookings = bookingsResponse.data.map((booking) => ({
          caretakerID: booking.AdditionalInfoID.CaretakerID,
          bookingID: booking._id, // Use _id for BookingID
          status: booking.CurrentStatus,
          bookingDate: booking.BookingDetailsID.BookingDate,
          bookingTime: booking.BookingDetailsID.BookingTime,
        }));
  
        // Filter out the selectedBooking for the current check
        const filteredSpaBookings = spaBookings.filter(
          (booking) =>
            booking.bookingID !== selectedBooking._id // Use _id for BookingID
        );
        
        // Map caretakers with availability status
        const updatedCaretakers = caretakers.map((caretaker) => {
          // Check if this caretaker is booked for the same date and time slot
          const isBusy = filteredSpaBookings.some((bookingDetail) => {
            return (
              bookingDetail.caretakerID === caretaker.id &&
              bookingDetail.bookingDate === selectedBooking.BookingDate &&
              bookingDetail.bookingTime === selectedBooking.BookingTime &&
              bookingDetail.status === 'Checked In'
            );
          });
  
          return {
            ...caretaker,
            isBusy,
          };
        });
  
        setCaretakers(updatedCaretakers);
      } catch (error) {
        console.error('Error fetching accounts or checking availability:', error);
      }
    };
  
    fetchAccountsAndCheckAvailability();
  }, [selectedBooking]);
  

  const handleCaretakerChange = async (value) => {
    const selectedCaretaker = caretakers.find(caretaker => caretaker.id === value);
    setSelectedCaretaker(selectedCaretaker);
    setCaretakerID(value);
    setCaretakerNote(selectedCaretaker ? selectedCaretaker.name : '');

    if (radioValue == 'Không') {
      setActualWeight(selectedBooking.PetWeight);
      setAdditionalCost(0);
      setFinalPrice(selectedBooking.TotalPrice);
      form.setFieldsValue({
        actualWeight: ''
      });
    }
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
      title: 'No.',
      key: 'index',
      fixed: 'left',
      className: 'sticky left-0 bg-white',
      render: (text, record, index) => (
        <Button type="link" onClick={() => navigate(`/spa-booking-detail/${record.id}`)}>
          {total - index}
        </Button>
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
      dataIndex: 'BookingDate',
      key: 'bookingDate',
      sorter: (a, b) => {
        const dateA = moment(a.BookingDate, 'DD/MM/YYYY');
        const dateB = moment(b.BookingDate, 'DD/MM/YYYY');
        return dateA - dateB;
      },
      render: (text, record) => (
        <Text>{record.BookingDate}</Text>
      ),
    },    
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Tag className='min-w-[70px] w-auto px-2 py-1 text-center' color={
          record.status === 'Completed' ? 'green' :
          record.status === 'Pending' ? 'yellow' :
          record.status === 'Checked In' ? 'blue' : 'red'}>
          {record.status}
        </Tag>
      )
    },
    {
      title: t('customer_name'),
      dataIndex: 'CustomerName',
      key: 'customerName',
    },
    {
      title: t('phone'),
      dataIndex: 'Phone',
      key: 'phone',
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (text, record) => renderActions(record),
    },
  ].filter(col => col.key !== 'actions' || role === 'Caretaker Staff' || role === 'Sales Staff');


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
    setSelectedCaretaker(null);
    setUpdateStatusModalVisible(false)
    setSelectedCancelSource('')
    setSelectedReason('')
    setReasonDetail('')
    setShowWeightInput(false)
    setRadioValue('Không');
  };

  // Show modal to update status and capture current booking details
  const showUpdateStatusModal = (id, status) => {
    const booking = spaBookings.find(booking => booking.id === id);
    setSelectedBooking(booking);
    setSelectedBookingId(id);
    console.log(selectedBooking)
    setPendingStatus(status);
    setUpdateStatusModalVisible(true);
    setActualWeight(null)
    setSelectedCaretaker(null)
    form.setFieldsValue({
      actualWeight: ''
    });
    setAdditionalCost(0)
    setFinalPrice(booking.TotalPrice)
  };


  const calculateAdditionalCost = async (weight) => {
    if (!selectedBooking) return;
    const serviceID = selectedBooking?.ServiceID;
    let voucherValue = 0;

    if (selectedBooking.VoucherID) {
      const voucherData = await getVoucherInformation(selectedBooking.VoucherID);
      voucherValue = voucherData.DiscountValue;
    }
    // Fetch service details
    const response = await axios.get(`${API_URL}/api/services/${serviceID}`);
    const service = response.data;

    // Find the price range that includes the actual weight
    const priceRange = service.PriceByWeight.find(range =>
      weight >= range.minWeight && weight <= range.maxWeight
    );

    if (priceRange) {
      const newAdditionalCost = priceRange.price - selectedBooking.TotalPrice - voucherValue;
      setAdditionalCost(newAdditionalCost);
      setFinalPrice(priceRange.price - voucherValue);
    } else {
      // Handle case where weight does not match any price range
      setAdditionalCost(0);
      setFinalPrice(selectedBooking.TotalPrice);
    }
  };

  const handleRadioChange = async (e) => {
    const value = e.target.value;
    setRadioValue(value);
    setShowWeightInput(value === 'Có');
    if (value === 'Không') {
      setActualWeight(selectedBooking.PetWeight);
      setAdditionalCost(0);
      setFinalPrice(selectedBooking.TotalPrice);
      form.setFieldsValue({
        actualWeight: ''
      });
    }
    console.log(caretakerID)
    console.log(selectedCaretaker)
    console.log(form.getFieldValue('actualWeight'))
    if ((value === 'Có' && form.getFieldValue('actualWeight') === '')) {
      setIsConfirmButtonDisabled(true);
    } else {
      setIsConfirmButtonDisabled(false);
    }
  };

  useEffect(() => {
    if (radioValue === 'Có' && form.getFieldValue('actualWeight') === '') {
      setIsConfirmButtonDisabled(true);
    } else {
      setIsConfirmButtonDisabled(false);
    }
  }, [radioValue, actualWeight, form]);

  function formatNumberWithCommas(number) {
    if (typeof number !== 'number') {
      return number;
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

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
            format={'DD/MM/YYYY'}
            onChange={handleBookingDateChange}
            style={{ width: 150, marginRight: 12 }}
          />
        </div>
        <div>
          <Text className="mr-1">{t('filter_created_date')}</Text>
          <DatePicker
            format={'DD/MM/YYYY'}
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
            disabled={saving ||
              (pendingStatus === 'Checked In' && !selectedCaretaker) ||
              (pendingStatus === 'Canceled' &&
                (!selectedCancelSource || !selectedReason)) ||
              isConfirmButtonDisabled ||
              !validate
            } // Disable the submit button during saving
          >
            {t('confirm')}
          </Button>
        ]}
      >
        <p>{t('ask_update')} "{pendingStatus}"?</p>
        {pendingStatus === 'Checked In' && (
          <div className="mb-4">
            <Text className="mr-1">{t('Nhân viên được yêu cầu: ')} {selectedBooking?.CaretakerNote || '-'}</Text><br />
            <Text className="mr-1">{t('Chọn nhân viên chăm sóc: ')}</Text>
            <Select
              placeholder={t('select_caretaker')}
              disabled={saving}
              onChange={handleCaretakerChange}
              style={{ width: 300 }}
              value={selectedCaretaker ? selectedCaretaker.id : undefined}
            >
              {caretakers.map(caretaker => (
                <Option key={caretaker.id}
                  value={caretaker.id}
                  disabled={caretaker.isBusy}>
                  {caretaker.name}
                </Option>
              ))}
            </Select>
            <div>
              <Text className="mr-1">{t('Phát sinh chi phí do chênh lệch cân nặng thực tế:')}</Text>
              <Radio.Group
                onChange={handleRadioChange}
                value={radioValue}
              >
                <Radio disabled={saving} value="Có">{t('Có')}</Radio>
                <Radio disabled={saving} value="Không">{t('Không')}</Radio>
              </Radio.Group>
            </div>
            {showWeightInput && (
              <div>
                <div className="flex flex-row ">
                  <Text className="mr-1">{t('Cân nặng thực tế:')}</Text>
                  <Form form={form}>
                    <Form.Item
                      name="actualWeight"
                      rules={[
                        {
                          required: true,
                          message: 'Cân nặng thực tế là bắt buộc',
                        },
                        { type: 'number', min: 0, max: 35, message: t('Chỉ nhập từ 0 tới 35 ') }
                      ]}
                    >
                      <InputNumber
                        value={actualWeight}
                        onChange={handleWeightChange}
                        style={{ width: 60 }}
                        className="h-10 w-10 items-center"
                        suffix='kg'
                        disabled={saving}
                      />
                    </Form.Item>
                  </Form>
                </div>
                <div>
                  <Text className="mr-1">{t('Phí phát sinh:')} {formatNumberWithCommas(additionalCost)}</Text>
                </div>
                <div>
                  <Text className="mr-1">{t('Tổng tiền:')} {formatNumberWithCommas(finalPrice)}</Text>
                </div>
              </div>
            )}
          </div>
        )}
        {pendingStatus === 'Canceled' && (
          <div className="mb-4">
            <p className="mb-2">{t('Lý do hủy từ:')}</p>
            <Radio.Group onChange={e => {
              setSelectedCancelSource(e.target.value);
              setSelectedReason('');
            }} value={selectedCancelSource}>
              <Radio disabled={saving} value="Khach">{t('Khách')}</Radio>
              <Radio disabled={saving} value="Tiem">{t('Tiệm')}</Radio>
            </Radio.Group>
            <div className="mt-2">
              {selectedCancelSource === 'Khach' && (
                <Select
                  disabled={saving}
                  placeholder={t('Chọn lý do')}
                  onChange={value => {
                    setSelectedReason(value);
                    if (value !== 'Khac') {
                      setSelectedReason(value);
                    }
                  }}
                  className="w-full"
                >
                  {selectedBooking.status !== 'Checked In' && (
                    <>
                      <Option value="Khách không đến tiệm để làm dịch vụ">{t('Khách không đến tiệm để làm dịch vụ')}</Option>
                      <Option value="Khách liên hệ hủy lịch do sự cố hoặc không còn nhu cầu nữa">{t('Khách liên hệ hủy lịch do sự cố hoặc không còn nhu cầu nữa')}</Option>
                      <Option value="Khách hủy lịch sau khi phát sinh chi phí">{t('Khách hủy lịch sau khi phát sinh chi phí')}</Option>
                    </>
                  )}
                  <Option value="Thú cưng không hợp tác">{t('Thú cưng không hợp tác')}</Option>
                  <Option value="Khac">{t('Khác')}</Option>
                </Select>
              )}
              {selectedCancelSource === 'Tiem' && (
                <Select
                  disabled={saving}
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
                <TextArea
                  disabled={saving}
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
          {selectedBooking?.StatusChanges.map((change, index) => (
            <Timeline.Item key={index} color={getStatusColor(change.Status)}>
              <Text strong>{change.Status}</Text> - <Text>{moment(change.ChangeTime).format('DD/MM/YYYY HH:mm')}</Text>
            </Timeline.Item>
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

export default BookingList;
