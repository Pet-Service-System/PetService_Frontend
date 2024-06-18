import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, List, Button} from 'antd';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const getSpaBookingById = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/spa-bookings/${id}`, {
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

const SpaBookingDetail = () => {
  const [spaBooking, setSpaBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchSpaBooking(id);
  }, [id]);

  const fetchSpaBooking = async (id) => {
    setLoading(true);
    try {
      const data = await getSpaBookingById(id);
      setSpaBooking(data);
    } catch (error) {
      console.error('Error fetching spa booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !spaBooking) {
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
          Chi tiết đặt dịch vụ Spa #{spaBooking.BookingDetailID}
        </Title>
        <div className="mb-4">
          <Text strong>Ngày tạo:</Text> <Text>{new Date(spaBooking.CreateDate).toLocaleDateString()}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Trạng thái:</Text> <Text>{spaBooking.Status}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Thời lượng:</Text> <Text>{new Date(spaBooking.Duration).toLocaleDateString()}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Tổng giá:</Text> <Text className="text-green-600">${spaBooking.BookingDetails.reduce((acc, detail) => acc + detail.Price, 0)}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Dịch vụ đã đặt:</Text>
        </div>
        <List
          dataSource={spaBooking.BookingDetails}
          renderItem={(detail, index) => (
            <List.Item key={index} className="px-4 py-2 flex-row">
              <Text>{detail.ServiceName}</Text>
              <Text className="text-green-600">${detail.Price}</Text>
            </List.Item>
          )}
          bordered
        />
      </Card>
    </div>
  );
};

export default SpaBookingDetail;
