import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, List, Button, Row, Col } from 'antd';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const getHotelBookingById = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/hotel-bookings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel booking:', error);
    throw error;
  }
}

const HotelBookingDetail = () => {
  const [hotelBooking, setHotelBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchHotelBooking();
  }, [id]);

  const fetchHotelBooking = async () => {
    setLoading(true);
    try {
      const data = await getHotelBookingById(id);
      setHotelBooking(data);
    } catch (error) {
      console.error('Error fetching hotel booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !hotelBooking) {
    return <Spin size="large" className="flex justify-center items-center h-screen" />;
  }
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
      <Card className="p-10 max-w-4xl mx-auto mt-4 shadow-lg rounded-lg ">
        <Title level={2} className="mb-4 text-center">
          Chi tiết đặt dịch vụ Khách sạn #{hotelBooking.BookingDetailID}
        </Title>
        <div className="mb-4">
          <Text strong>Ngày tạo:</Text> <Text>{new Date(hotelBooking.CreateDate).toLocaleDateString()}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Trạng thái:</Text> <Text>{hotelBooking.Status}</Text>
        </div>
        {/* <div className="mb-4">
          <Text strong>Thời lượng:</Text> <Text>{new Date(hotelBooking.Duration).toLocaleDateString()}</Text>
        </div> */}
        <div className="mb-4">
          <Text strong>Tổng giá:</Text> <Text className="text-green-600">${hotelBooking.BookingDetails.reduce((acc, detail) => acc + detail.TotalPrice, 0)}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Dịch vụ đã đặt:</Text>
        </div>
        <List
          dataSource={hotelBooking.BookingDetails}
          renderItem={(detail, index) => (
            <List.Item key={index} className="px-4 py-2">
              <Row style={{ width: '100%' }}>
                <Col span={6}>
                  <Text strong>Hotel Name:</Text> <Text>{detail.HotelName}</Text>
                </Col>
                <Col span={6}>
                  <Text strong>Total Price:</Text> <Text className="text-green-600">${detail.TotalPrice}</Text>
                </Col>
                <Col span={6}>
                  <Text strong>Check-in:</Text> <Text>{new Date(detail.CheckInDate).toLocaleDateString()}</Text>
                </Col>
                <Col span={6}>
                  <Text strong>Check-out:</Text> <Text>{new Date(detail.CheckOutDate).toLocaleDateString()}</Text>
                </Col>
              </Row>
            </List.Item>
          )}
          bordered
        />
      </Card>
    </div>
  );
};

export default HotelBookingDetail;
