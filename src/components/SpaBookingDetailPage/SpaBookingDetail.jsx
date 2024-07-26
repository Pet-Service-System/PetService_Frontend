import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, Table, Button, Image, message, Modal, Row, Col, Steps, Tag } from 'antd';
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const PAYPAL_CLIENT_ID = import.meta.env.REACT_APP_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = import.meta.env.REACT_APP_PAYPAL_CLIENT_SECRET;

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Step } = Steps;
const API_URL = import.meta.env.REACT_APP_API_URL;

const SpaBookingDetail = () => {
  const [spaBooking, setSpaBooking] = useState(null);
  const [spaBookingDetail, setSpaBookingDetail] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  // Fetch spa booking by ID
  const getSpaBookingById = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/Spa-bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  // Fetch spa booking data
  const fetchSpaBooking = async () => {
    setLoading(true);
    try {
      const booking = await getSpaBookingById(id);
      const bookingDetail = await getSpaBookingDetail(id);
      const serviceInfo = await getSpaServiceByID(bookingDetail.ServiceID);
      setSpaBooking(booking);
      setSpaBookingDetail(bookingDetail);
      setServiceData(serviceInfo);
    } catch (error) {
      console.error('Error fetching spa booking:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaBooking();
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
      title={change.Status}
      description={new Date(change.ChangeTime).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })}
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

  return ( spaBookingDetail &&
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
              <Text strong>{t('book_time')}: </Text>
              <Text>{spaBookingDetail.BookingTime}</Text>
            </div>
            <div className="mb-4">
              <Text strong>{t('Nhân viên chăm sóc')}: </Text>
              <Text>{spaBooking.CaretakerNote}</Text>
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
            <Text strong>{t('pet_weight')}: </Text>
            <Text>{spaBookingDetail.PetWeight} kg</Text>
          </div>
          <div className="mb-4 flex justify-between">
            <Text strong>{t('pet_age')}: </Text>
            <Text>{spaBookingDetail.PetAge} {t('years_old')}</Text>
          </div>
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
        {spaBookingDetail.Feedback && (
          <Card className="text-left w-full ml-auto">
            <Title level={3} className="text-center">Đánh giá của khách hàng</Title>
            <div className="mt-4">
              <Text className="text-3xl" strong>{t('feedback')}: </Text>
              <Text className="text-3xl">{spaBookingDetail.Feedback}</Text>
            </div>
          </Card>
        )}
        
        <Card className="text-right w-1/2 ml-auto border-none">
          <div className="mb-4 flex justify-end items-center">
            <Text strong className="mr-2">{t('Tổng tiền')}:</Text>
            <Text className="mb-4 text-green-600 text-4xl flex justify-between">{spaBooking.TotalPrice.toLocaleString('en-US')}đ</Text>
          </div>
        </Card>
        {/* Render the cancel button conditionally */}
        {(role === 'Customer') && spaBooking.CurrentStatus !== 'Completed' && spaBooking.CurrentStatus !== 'Canceled' && (
          <Button danger className="float-end mt-4" onClick={handleCancelBooking}>
            {t('cancel_booking')}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default SpaBookingDetail;
