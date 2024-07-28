import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, Table, Button, Image, message, Modal, Row, Col, Steps, Tag, Form, Select, DatePicker } from 'antd';
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import TextArea from "antd/es/input/TextArea";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Step } = Steps;
const API_URL = import.meta.env.REACT_APP_API_URL;
const PAYPAL_CLIENT_ID = import.meta.env.REACT_APP_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = import.meta.env.REACT_APP_PAYPAL_CLIENT_SECRET;

const SpaBookingDetail = () => {
  const [spaBooking, setSpaBooking] = useState(null);
  const [spaBookingDetail, setSpaBookingDetail] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackingBookingDetailsId, setFeedbackingBookingDetailsId] = useState(null);
  const [caretakers, setCaretakers] = useState([]); // List of available caretakers
  const [isChangeModalVisible, setIsChangeModalVisible] = useState(false); // Modal visibility state
  const [form] = Form.useForm(); // Antd form instance
  const [voucherData, setVoucherData] = useState(null)
  const [caretakersName, setCaretakersName] = useState(null);
  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30"
  ];
  const currentDateTime = moment();
  const [operationLoading, setOperationLoading] = useState(false);
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [discountValue, setDiscountValue] = useState(0)

  const user = JSON.parse(localStorage.getItem("user"));
  const accountID = user?.id;
  const [feedbackContent, setFeedbackContent] = useState("");
  const [replies, setReplies] = useState([]);
  const [access, setAccess] = useState(true);

  const startFeedback = (id) => {
    setFeedbackingBookingDetailsId(id);
    setFeedbackContent("");
  };

  const cancelFeedback = () => {
    setFeedbackingBookingDetailsId(null);
    setFeedbackContent("");
  };

  const handleFeedbackContentChange = (e) => {
    setFeedbackContent(e.target.value);
  };

  const fetchReply = async (BookingID) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API_URL}/api/replies/${BookingID}`,
        config
      );
      if (response.data && response.data[0]) {
        return response.data[0];
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };
  
  const submitReply = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      if (spaBooking.isReplied) {
        message.error(t("you_can_only_reply_once"));
        return;
      }

      if (!feedbackContent || feedbackContent.trim() === "") {
        return;
      }

      const newReply = {
        BookingID: spaBooking.BookingID,
        AccountID: accountID,
        ReplyContent: feedbackContent,
        ReplyDate: new Date(),
      };

      const response = await axios.post(`${API_URL}/api/replies`, newReply, {
        headers: {
          Authorization: `Bearer ${token}`, // Use backticks for template literals
        },
      });

      if (response.status === 201) {
        const createdReply = response.data;
        const bookingResponse = await axios.patch(
          `${API_URL}/api/Spa-bookings/${spaBooking.BookingID}`,
          { isReplied: true },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Use backticks for template literals
            },
          }
        );
        if (bookingResponse.status === 200) {
          setReplies((prevReplies) => [...prevReplies, createdReply]);
          setSpaBooking({ ...spaBooking, isReplied: true });
          message.success(t("reply_successfully"));
          setFeedbackingBookingDetailsId(null);
          setFeedbackContent("");
        }
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      const errorMessage = error.response?.data?.message || t("error_reply");
      message.error(errorMessage);
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

  const fetchVoucher = async (voucherId) => {
    try {
      const voucherData = await getVoucherInformation(voucherId);
      if(voucherData){
        setVoucherData(voucherData);
        setDiscountValue(voucherData.DiscountValue)
      }
    } catch (error) {
      console.error('Error fetching voucher details:', error);
    }
  };

  // Fetch spa booking by ID
  const getSpaBookingById = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/Spa-bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const spaBooking = response.data
      if (spaBooking.VoucherID) {
        fetchVoucher(spaBooking.VoucherID);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching spa booking:', error);
      throw error;
    }
  };

  // Fetch spa booking detail by ID
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

  // Fetch spa service by ID
  const getSpaServiceByID = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching spa service detail:', error);
      throw error;
    }
  };

  const getFullName = async (CaretakerID) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/accounts/fullname/${CaretakerID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching full name:', error);
    }
  };


  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/accounts/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Filter out Caretaker Staff accounts and map to include both id and name
      const caretakers = response.data.accounts
        .filter(account => account.role === 'Caretaker Staff')
        .map(account => ({
          id: account.AccountID,
          name: account.fullname
        }));
      setCaretakers(caretakers);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaretakerChange = (value) => {
    const selectedCaretaker = caretakers.find(caretaker => caretaker.id === value);
    form.setFieldsValue({
      CaretakerID: selectedCaretaker ? selectedCaretaker.id : '',
      CaretakerNote: selectedCaretaker ? selectedCaretaker.name : ''
    });
  };

  // Fetch spa booking data
  const fetchSpaBooking = async () => {
    setLoading(true);
    try {
      const booking = await getSpaBookingById(id);
      const bookingDetail = await getSpaBookingDetail(id);
      const serviceInfo = await getSpaServiceByID(bookingDetail.ServiceID);
      const caretakersName = await getFullName(booking.CaretakerID);
      const reply = await fetchReply(booking.BookingID);

      setSpaBooking(booking);
      setSpaBookingDetail(bookingDetail);
      setServiceData(serviceInfo);
      setCaretakersName(caretakersName);
      if(role === 'Caretaker Staff' && accountID !== booking.CaretakerID){
        setAccess(false)
        navigate('/manage-spa-bookings')
      }
      setReplies(reply);
    } catch (error) {
      console.error('Error fetching spa booking:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaBooking();
    fetchAccounts();
    fetchReply();
  }, []);

  if (loading || !spaBooking || !spaBookingDetail) {
    return <Spin size="large" className="flex justify-center items-center h-screen" />;
  }

  const petTypeMapping = {
    PT001: 'Chó',
    PT002: 'Mèo',
  };

  const petTypeName = petTypeMapping[spaBookingDetail.PetTypeID] || 'Unknown';

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

  // Generate steps for status changes
  const statusSteps = spaBooking.StatusChanges.map((change, index) => (
    <Step
      key={index}
      title={
        <div className="ml-14">
          {change.Status}
        </div>
      }
      description={
        <div className="ml-14">
          <span className="block mb-1">
            {new Date(change.ChangeTime).toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </span>
        </div>
      }
      status={change.Status === 'Canceled' ? 'error' : 'process'}
      icon={
        <Tag color={getStatusColor(change.Status)}>{change.Status}</Tag>
      }
    />
  ));

  // Columns configuration for the table
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'ImageURL',
      render: (imageURL) => <Image src={imageURL} alt="Service" style={{ width: 50, height: 50 }} />,
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'ServiceName',
      render: (text, record) => (
        <Link className="text-blue-500 hover:text-blue-800" to={`/spa-service-detail/${record.ServiceID}`}>
          {text}
        </Link>
      ),
    },
  ];

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    confirm({
      title: t('cofirm_cancel_booking'),
      icon: <ExclamationCircleOutlined />,
      content: t('are_you_sure_cancel_booking'),
      okText: t('agree'),
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          // Make API call to update order status to 'Canceled'
          const response = await axios.put(
            `${API_URL}/api/Spa-bookings/${spaBooking.BookingID}`,
            { Status: 'Canceled' },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status !== 200) {
            throw new Error(`Failed to cancel booking ${spaBooking.OrderID}`);
          }
          await processRefund(spaBooking.PaypalOrderID);
          fetchSpaBooking();

          // Show success message
          message.success(t('success_cancel_booking'));
        } catch (error) {
          console.error('Error cancelling booking:', error);
          message.error(t('error_occur_cancel_booking'));
        }
      },
    });
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

  // Process refund via PayPal
  const processRefund = async (paypalOrderID) => {
    try {
      const accessToken = await getPaypalAccessToken();
      const response = await axios.post(
        `https://api-m.sandbox.paypal.com/v2/payments/captures/${paypalOrderID}/refund`,
        {},
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

  // Check if the "Change Information Booking" button should be enabled
  const isBefore24Hours = () => {
    if (!spaBookingDetail) return false;

    const bookingDateTime = moment(`${spaBookingDetail.BookingDate} ${spaBookingDetail.BookingTime}`, 'DD-MM-YYYY HH:mm');
    const now = moment();
    // Enable button if the current time is more than 24 hours before the booking time
    return now.isBefore(bookingDateTime.subtract(24, 'hours'));
  };
  
  // Handle Change Information Booking
  const handleOpenChangeModal = () => {
    setIsChangeModalVisible(true);
  };

  // Handle OK for Change Information Modal
  const handleOkChangeModal = async () => {
    setOperationLoading(true);
    try {
      const values = await form.validateFields();
      const newBookingDate = values.BookingDate;
      const newBookingTime = values.BookingTime;
      const newCaretakerId = values.caretaker;
      const selectedCaretaker = caretakers.find(caretaker => caretaker.id === newCaretakerId);

      const newBookingDateTime = moment(`${newBookingDate.format('DD-MM-YYYY')} ${newBookingTime}`, 'DD-MM-YYYY HH:mm');
      const currentDateTime = moment();

      // Ensure the new booking time is at least 3 hours from now
      if (newBookingDateTime.diff(currentDateTime, 'hours') < 3) {
        message.error(t('3_hours_rule'));
        setOperationLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      await axios.put(
        `${API_URL}/api/spa-booking-details/${spaBookingDetail.BookingDetailsID}`,
        {
          BookingDate: newBookingDate.format('DD-MM-YYYY'),
          BookingTime: newBookingTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await axios.put(
        `${API_URL}/api/Spa-bookings/${spaBooking.BookingID}`,
        {
          CaretakerNote: selectedCaretaker ? selectedCaretaker.name : '',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (newBookingDateTime.diff(currentDateTime, 'hours') < 24) {
        confirm({
          title: t('annouce_before_change'),
          icon: <ExclamationCircleOutlined />,
          onOk() {
            message.success('Change information successfully.');
            setIsChangeModalVisible(false);
            fetchSpaBooking();
          },
          onCancel() {
            message.info('Change cancelled.');
          },
        });
      } else {
        message.success('Change information successfully.');
        setIsChangeModalVisible(false);
        fetchSpaBooking();
      }
    } catch (error) {
      console.error('Error changing booking information:', error);
      message.error('Error changing booking information');
    } finally {
      setOperationLoading(false);
    }
  };
  const handleCancelChangeModal = () => {
    setIsChangeModalVisible(false);
  };

  function formatNumberWithCommas(number) {
    if (typeof number !== 'number') {
        return number;
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  return (spaBookingDetail && spaBooking && access &&
    <div className="p-4 md:p-8 lg:p-12">
      {/* Go back */}
      <Button
        onClick={() => navigate(-1)}
        className="bg-blue-500 hover:bg-blue-700 text-white rounded transition duration-300"
        icon={<ArrowLeftOutlined />}
        size="large"
      >
        {t('back')}
      </Button>
      {/* Booking detail */}
      <Card className="p-4 max-w-screen-md mx-auto shadow-lg rounded-lg transform scale-90">
        <Title level={2} className="mb-4 text-center">{t('spa_booking_detail_title')} #{spaBooking.BookingID}</Title>

        {/* Status Tracking Bar */}
        <Steps current={spaBooking.StatusChanges.length - 1} direction="horizontal" className="mb-8">
          {statusSteps}
        </Steps>
        {spaBooking.CurrentStatus == 'Canceled' && (
          <div className="mb-2">
            <Text strong className="text-3xl text-red-600">Lí do hủy: </Text>
            <Text className="text-3xl">{spaBooking.CancelReason}.</Text>
          </div>
        )}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="mb-4">
              <Text strong>{t('date_create')}: </Text>
              <Text>
                {new Date(spaBooking.CreateDate).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}{' '}
                {new Date(spaBooking.CreateDate).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </Text>
            </div>
            <div className="mb-4">
              <Text strong>{t('customer_name')}: </Text>
              <Text>{spaBookingDetail.CustomerName}</Text>
            </div>
            <div className="mb-4">
              <Text strong>{t('phone')}: </Text>
              <Text>{spaBookingDetail.Phone}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div className="mb-4">
              <Text strong>{t('book_date')}: </Text>
              <Text>{spaBookingDetail.BookingDate}</Text>
            </div>
            <div className="mb-4">
              <Text strong>{t('book_time')}: </ Text>
              <Text>{spaBookingDetail.BookingTime}</Text>
            </div>
            <div className="mb-4">
              <Text strong>{t('Nhân viên chăm sóc')}: </Text>
              <Text>{caretakersName?.fullname}</Text>
            </div>
          </Col>
        </Row>
        <Card title={t('pet_information')} className="mb-4">
          <div className="mb-4 flex justify-between">
            <Text strong>{t('pet_name')}: </Text>
            <Text>{spaBookingDetail.PetName}</Text>
          </div>
          <div className="mb-4 flex justify-between">
            <Text strong>{t('pet_gender')}: </Text>
            <Text>{spaBookingDetail.PetGender}</Text>
          </div>
          <div className="mb-4 flex justify-between">
            <Text strong>{t('pet_status')}: </Text>
            <Text>{spaBookingDetail.PetStatus}</Text>
          </div>
          <div className="mb-4 flex justify-between">
            <Text strong>{t('pet_type')}: </Text>
            <Text>{petTypeName}</Text>
          </div>
          <div className="mb-4 flex justify-between">
            <Text strong>{t('pet_age')}: </Text>
            <Text>{spaBookingDetail.PetAge} {t('years_old')}</Text>
          </div>
          <div className="mb-4 flex justify-between">
            <Text strong>{t('pet_weight')}: </Text>
            <Text>{spaBookingDetail.PetWeight} kg</Text>
          </div>
          {spaBookingDetail.ActualWeight !== spaBookingDetail.PetWeight && spaBooking.ExtraCharge != 0 && spaBookingDetail.ActualWeight !== null && (
            <div className="mb-4 flex justify-between">
            <Text strong>{t('Cân nặng thực tế: ')} </Text>
            <Text>{spaBookingDetail.ActualWeight} kg</Text>
          </div>
          )}
        </Card>
        <div className="mb-4">
          <Text strong>{t('booked_services')}:</Text>
        </div>
        <Table
          dataSource={serviceData ? [serviceData] : []}
          columns={columns}
          scroll={{ x: 'max-content' }}
          pagination={false}
        />

        {spaBooking.Feedback && (
            <>
              <Card className="text-left w-full ml-auto">
                <div className="flex justify-between items-center">
                  <Title level={3} className="m-0">
                    Đánh giá của khách hàng
                  </Title>
                  {role == 'Caretaker Staff' && (
                    <Button
                      className="ml-4"
                      onClick={() => startFeedback(spaBooking.BookingDetailsID)}
                      disabled={spaBooking.isReplied}
                    >
                      {t("reply")}
                    </Button>
                  )}
                </div>
                <div className="mt-4">
                  <Text className="text-3xl" strong>
                    {t("feedback")}:{" "}
                  </Text>
                  <Text className="text-3xl">{spaBooking.Feedback}</Text>
                </div>
                {replies && (
                  <Card className="border-none">
                    <div className="flex flex-col">
                      <div className="flex flex-row">
                        <Text strong className="text-2xl">{caretakersName.fullname}</Text>
                        <Text className="text-gray-400">
                          {" - "}
                          {moment(replies.ReplyDate).format("DD/MM/YYYY")}
                        </Text>
                      </div>
                      <Text>{replies.ReplyContent}</Text>
                    </div>
                  </Card>
                )}
              </Card>
            </>
          )}

          {feedbackingBookingDetailsId === spaBooking.BookingDetailsID && (
            <Card className="text-left w-full ml-auto mt-4">
              <Title level={3} className="text-center">
                {t("reply to feedback")}
              </Title>
              <div className="mt-4">
                <TextArea
                  rows={4}
                  value={feedbackContent}
                  onChange={handleFeedbackContentChange}
                  placeholder={t("enter yourreply")}
                />
                <div className="mt-4 text-right">
                  <Button onClick={cancelFeedback}>{t("cancel")}</Button>
                  <Button type="primary" onClick={submitReply} className="ml-2">
                    {t("submit")}
                  </Button>
                </div>
              </div>
            </Card>
          )} 

        <Card className="md:text-right md:w-3/5 md:ml-auto border-none">
          {spaBookingDetail.ActualWeight !== spaBookingDetail.PetWeight && spaBooking.ExtraCharge != 0 && spaBookingDetail.ActualWeight !== null ? (
            <div>
              <div className="mb-2 flex justify-between items-end">
                <Text strong className="mr-2 md:text-2xl">{t('Thành tiền')}:</Text>
                <Text className="flex justify-between md:text-2xl">{formatNumberWithCommas(spaBooking.TotalPrice)}đ</Text>
              </div>
              {voucherData && (
                <div className="mb-4 flex flex-row justify-between">
                  <Text className="md:text-2xl mr-2" strong>Áp dụng voucher({voucherData.Pattern}): </Text>
                  <Text className="md:text-2xl text-red-600"> -{formatNumberWithCommas(discountValue)}đ</Text>
                </div>
              )}
              <div className="mb-4 flex justify-between items-end">
                <Text strong className="mr-2 md:text-2xl">{t('Chi phí phát sinh: ')}</Text>
                <Text className="flex justify-between md:text-2xl">{formatNumberWithCommas(spaBooking.ExtraCharge)}đ</Text>
              </div>
              <div className="flex justify-between items-end">
                <Text strong className="mr-2 md:text-4xl">{t('Tổng tiền: ')}</Text>
                <Text className="text-green-600 text-3xl md:text-4xl flex justify-between">{formatNumberWithCommas(spaBooking.FinalPrice-discountValue)}đ</Text>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:ml-auto mt-4 mb-4 border-none">
              {voucherData && (
                <div>
                  <div className="mb-4 flex flex-row justify-between">
                    <Text className="md:text-2xl mr-2 text-left" strong>Thành tiền</Text>
                    <Text className="md:text-2xl">{spaBooking.TotalPrice}đ</Text>
                  </div>
                  <div className="mb-4 flex flex-row justify-between">
                    <Text className="md:text-2xl mr-2 text-left" strong>Áp dụng voucher({voucherData.Pattern}): </Text>
                    <Text className="md:text-2xl text-red-600"> -{formatNumberWithCommas(discountValue)}</Text>
                  </div>
                </div>
              )}
              <div className="flex flex-row justify-between">
                <Text strong className="mr-2 md:text-4xl">{t('Tổng tiền: ')}</Text>
                <Text className="text-green-600 text-3xl md:text-4xl flex justify-between">{formatNumberWithCommas(spaBooking.TotalPrice - discountValue)}đ</Text>
              </div>
            </div>
          )}
        </Card>
        {(role === 'Customer') && spaBooking.CurrentStatus !== 'Completed' && spaBooking.CurrentStatus !== 'Canceled' && (
          <Button
            type="primary"
            onClick={handleOpenChangeModal}
            disabled={!isBefore24Hours() || role !== 'Customer' || spaBooking.CurrentStatus !== 'Pending'}
          >
            {t('change_information_booking')}
          </Button>
        )}
        {/* Render the cancel button conditionally */}
        {(role === 'Customer') && spaBooking.CurrentStatus !== 'Completed' && spaBooking.CurrentStatus !== 'Canceled' && (
          <Button 
            danger 
            className="float-end mt-4"
            onClick={handleCancelBooking}
            disabled={!isBefore24Hours()}>
            {t('cancel_booking')}
          </Button>
        )}
      </Card>

      {/* Change Information Modal */}
      <Modal
        title={t('change_information_booking')}
        visible={isChangeModalVisible}
        onOk={handleOkChangeModal}
        onCancel={handleCancelChangeModal}
        confirmLoading={operationLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="BookingDate"
            label={t('booking_date')}
            rules={[{ required: true, message: t('plz_choose_booking_date') }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => {
                if (current && current < currentDateTime.startOf('day')) {
                  return true;
                }
                if (current && current.isSame(currentDateTime, 'day')) {
                  return current < currentDateTime;
                }
                return false;
              }}
            />
          </Form.Item>
          <Form.Item
            name="BookingTime"
            label={t('booking_time')}
            rules={[{ required: true, message: t('plz_choose_booking_time') }]}
          >
            <Select
              style={{ width: '100%' }}
              placeholder={t('choose_booking_time')}
            >
              {availableTimes.map(time => (
                <Select.Option key={time} value={time}>{time}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="caretaker"
            label={t('Nhân viên chăm sóc')}
          >
            <Select
              placeholder={t('choose_caretaker')}
              onChange={handleCaretakerChange}
            >
              {/* Empty option */}
              <Select.Option value='' key="empty-option">
                {t('[Trống]')}
              </Select.Option>

              {/* Options for caretakers */}
              {caretakers.map(caretaker => (
                <Select.Option key={caretaker.id} value={caretaker.id}>
                  {caretaker.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SpaBookingDetail;
