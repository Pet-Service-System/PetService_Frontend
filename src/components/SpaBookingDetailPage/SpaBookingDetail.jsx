import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, List, Button } from 'antd'; // Import các componess)
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const getSpaBookings = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const AccountID = user.id;
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/Spa-bookings/account/${AccountID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data[0];
  } catch (error) {
    console.error('Error fetching spa bookings:', error);
    throw error;
  }
}

const SpaBookingDetail = () => {
  const [spaBookings, setSpaBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook useHistory từ React Router

  useEffect(() => {
    fetchSpaBookings();
  }, []);

  const fetchSpaBookings = async () => {
    setLoading(true); // Start loading indicator
    try {
      const data = await getSpaBookings();
      setSpaBookings(data);
    } catch (error) {
      console.error('Error fetching spa bookings:', error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  if (loading || !spaBookings) {
    return <Spin size="large" className="flex justify-center items-center h-screen" />;
  }

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <Button
        onClick={() => navigate(-1)}
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
        icon={<ArrowLeftOutlined />} 
        size="large"
      >
        Quay về
      </Button>
      <Card className="p-6 max-w-4xl mx-auto mt-10 shadow-lg rounded-lg">
        <Title level={2} className="mb-4 text-center">Chi tiết đặt dịch vụ Spa #{spaBookings.BookingDetailID}</Title>
        <div className="mb-4">
          <Text strong>Ngày tạo:</Text> <Text>{new Date(spaBookings.CreateDate).toLocaleDateString()}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Trạng thái:</Text> <Text>{spaBookings.Status}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Thời lượng:</Text> <Text>{spaBookings.Duration}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Tổng giá:</Text> <Text>${spaBookings.TotalPrice}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Dịch vụ đã đặt:</Text>
        </div>
        
        <List
          dataSource={spaBookings.BookingDetails}
          renderItem={(service, index) => (
            <List.Item key={index} className="px-4 py-2">
              <Text>{service.ServiceName} - ${service.Price}</Text>
            </List.Item>
          )}
          bordered
        />
      </Card>
    </div>
  );
};

export default SpaBookingDetail;
