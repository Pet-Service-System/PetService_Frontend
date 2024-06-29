import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, Table, Button, Image } from 'antd';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const getSpaBookingById = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/Spa-bookings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching spa booking:', error);
    throw error;
  }
}

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
}

const getSpaServiceByID = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/services/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching spa service detail:', error);
    throw error;
  }
}

const SpaBookingDetail = () => {
  const [spaBooking, setSpaBooking] = useState(null);
  const [spaBookingDetail, setSpaBookingDetail] = useState(null);
  const [serviceData, setServiceData] = useState(null)
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchSpaBooking = async () => {
      setLoading(true);
      try {
        const booking = await getSpaBookingById(id);
        const bookingDetail = await getSpaBookingDetail(id);
        const serviceInfo = await getSpaServiceByID(bookingDetail.ServiceID)
        setSpaBooking(booking);
        setSpaBookingDetail(bookingDetail);
        setServiceData(serviceInfo)
      } catch (error) {
        console.error('Error fetching spa booking:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpaBooking();
  }, [id]);

  if (loading || !spaBooking || !spaBookingDetail) {
    return <Spin size="large" className="flex justify-center items-center h-screen" />;
  }

  const petTypeMapping = {
    PT001: 'Chó',
    PT002: 'Mèo',
  };

  const petTypeName = petTypeMapping[spaBookingDetail.PetTypeID] || 'Unknown';

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
    },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <Button
        onClick={() => navigate(-1)}
        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
        icon={<ArrowLeftOutlined />}
        size="large"
      >
        Quay về
      </Button>
      <Card className="p-10 max-w-4xl mx-auto mt-4 shadow-lg rounded-lg">
        <Title level={2} className="mb-4 text-center">
          Chi tiết đặt dịch vụ Spa #{spaBooking.BookingID}
        </Title>
        <div className="mb-4">
          <Text strong>Ngày tạo:</Text> <Text>{new Date(spaBooking.CreateDate).toLocaleDateString()}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Tên khách hàng: </Text>
          <Text>{spaBookingDetail.CustomerName}</Text>
        </div>
        <div className="mb-4">
          <Text strong>SĐT: </Text>
          <Text>{spaBookingDetail.Phone}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Tên thú cưng: </Text>
          <Text>{spaBookingDetail.PetName}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Giới tính thú cưng: </Text>
          <Text>{spaBookingDetail.PetGender}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Trạng thái thú cưng: </Text>
          <Text>{spaBookingDetail.PetStatus}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Loại thú cưng: </Text>
          <Text>{petTypeName}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Cân nặng thú cưng: </Text>
          <Text>{spaBookingDetail.PetWeight} kg</Text>
        </div>
        <div className="mb-4">
          <Text strong>Tuổi thú cưng: </Text>
          <Text>{spaBookingDetail.PetAge} tuổi</Text>
        </div>
        <div className="mb-4">
          <Text strong>Ngày đặt lịch: </Text>
          <Text>{spaBookingDetail.BookingDate}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Thời gian đặt lịch: </Text>
          <Text>{spaBookingDetail.BookingTime}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Trạng thái: </Text> 
          <Text className={
            spaBooking.Status === 'Completed' ? 'text-green-600' :
            spaBooking.Status === 'Pending' || spaBooking.Status === 'Processing' ? 'text-orange-400' :
            'text-red-600'
          }>
            {spaBooking.Status}
          </Text>
        </div>
        <div className="mb-4">
          <Text strong>Tổng giá:</Text> <Text className="text-green-600">${spaBooking.TotalPrice}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Dịch vụ đã đặt:</Text>
        </div>
        <Table
          dataSource={serviceData ? [serviceData] : []} 
          columns={columns}
          pagination={false} 
        />
        {spaBookingDetail.Feedback && (
          <div className="mt-4">
            <Text strong>Đánh giá: </Text>
            <Text>{spaBookingDetail.Feedback}</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SpaBookingDetail;
