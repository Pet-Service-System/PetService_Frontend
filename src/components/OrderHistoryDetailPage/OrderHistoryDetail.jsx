import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, List, Button, Row, Col } from 'antd';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const getOrderDetails = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/orders/${id}`, {
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


const OrderHistoryDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails(id);
  }, [id]);

  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const data = await getOrderDetails(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !order) {
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
      <Card className="p-6 max-w-4xl mx-auto mt-4 shadow-lg rounded-lg">
        <Title level={2} className="mb-4 text-center">Chi tiết đơn hàng #{order.OrderID}</Title>
        <div className="mb-4">
          <Text strong>Ngày đặt hàng:</Text> <Text>{new Date(order.OrderDate).toLocaleDateString()}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Trạng thái:</Text> <Text>{order.Status}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Số điện thoại:</Text> <Text>{order.phone}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Địa chỉ:</Text> <Text>{order.Address}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Tổng giá:</Text> <Text className="text-green-600">${order.TotalPrice}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Chi tiết đơn hàng:</Text>
        </div>
        
        <List
          dataSource={order.OrderDetails}
          renderItem={(detail, index) => (
            <List.Item key={index} className="px-4 py-2">
              <Row style={{ width: '100%' }}>
                <Col span={8}>
                 <Text>{detail.ProductName}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Số lượng:</Text> <Text>{detail.Quantity}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Giá:</Text> <Text className="text-green-600">${detail.Price}</Text>
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

export default OrderHistoryDetail;
