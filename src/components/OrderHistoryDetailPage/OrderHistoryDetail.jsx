import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, List, Button, Row, Col, Modal, Rate, Input, message } from 'antd';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const accountID = JSON.parse(localStorage.getItem('user')).id;

const getOrder = async (id) => {
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

const getOrderDetail = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/order-details/order/${id}`, {
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

const getComments = async (productId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3001/api/comments/product/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

const OrderHistoryDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();
  const [userHasCommented, setUserHasCommented] = useState(false);

  useEffect(() => {
    fetchOrderDetails(id);
  }, [id]);

  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const data = await getOrder(orderId);
      setOrder(data);
      const detailData = await getOrderDetail(orderId);
      setOrderDetail(detailData);

      const productId = detailData.Products[0].ProductID;
      const comments = await getComments(productId);
      const userComment = comments.find(comment => comment.AccountID === accountID);
      setUserHasCommented(!!userComment);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/comments/',
        {
          ProductID: orderDetail.Products[0].ProductID,
          AccountID: accountID,
          Rating: rating,
          CommentContent: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Comment created:', response.data);
      message.success('Comment successfully!');
      setUserHasCommented(true);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setShowModal(false);
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
          <Text strong>Tên khách hàng:</Text> <Text>{order.CustomerName}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Số điện thoại:</Text> <Text>{order.Phone}</Text>
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
          dataSource={orderDetail.Products}
          renderItem={(detail, index) => (
            <List.Item key={index} className="px-4 py-2">
              <Row style={{ width: '100%' }}>
                <Col span={6}>
                  <Text>{detail.ProductName}</Text>
                </Col>
                <Col span={6}>
                  <Text strong>Số lượng:</Text> <Text>{detail.Quantity}</Text>
                </Col>
                <Col span={6}>
                  <Text strong>Giá:</Text> <Text className="text-green-600">${detail.Price}</Text>
                </Col>
                <Col span={6}>
                  <Button 
                    type="primary" 
                    onClick={() => setShowModal(true)} 
                    disabled={order.Status !== 'Shipped' || userHasCommented}
                  >
                    {userHasCommented ? 'Đã đánh giá' : 'Comment'}
                  </Button>
                </Col>
              </Row>
            </List.Item>
          )}
          bordered
        />

        <Modal
          title="Đánh giá đơn hàng"
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="cancel" onClick={() => setShowModal(false)}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmit}>
              Đánh giá
            </Button>,
          ]}
        >
          <Rate onChange={(value) => setRating(value)} value={rating} />
          <Input.TextArea
            placeholder="Nhập nhận xét của bạn..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </Modal>
      </Card>
    </div>
  );
};

export default OrderHistoryDetail;
