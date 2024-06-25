import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, Table, Button, Modal, Rate, Input, message } from 'antd';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';
import 'tailwindcss/tailwind.css';

const { Title, Text } = Typography;

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
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
}

const OrderHistoryDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedProductID, setSelectedProductID] = useState(null);
  const navigate = useNavigate();
  const accountID = JSON.parse(localStorage.getItem('user')).id;
  const role = localStorage.getItem('role')

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
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (productID) => {
    setSelectedProductID(productID);
    setRating(0); // Reset rating
    setComment(''); // Reset comment
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      message.warning('Please provide a rating.');
      return;
    }
    if (comment.trim() === '') {
      message.warning('Please provide a comment.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/comments/',
        {
          ProductID: selectedProductID,
          AccountID: accountID,
          Rating: rating,
          CommentContent: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Comment created:', response.data);
      message.success('Comment successfully!');
      fetchOrderDetails(id); // Refresh comments
    } catch (error) {
      if (error.response && error.response.status === 404) {
        message.error(`You have already commented on this product.`);
      } else {
        console.error('Error creating comment:', error);
        message.error('Failed to create comment.');
      }
    } finally {
      setShowModal(false);
    }
  };

  if (loading || !order) {
    return <Spin size="large" className="flex justify-center items-center h-screen" />;
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Canceled':
        return 'text-red-600';
      case 'Processing':
      case 'Delivering':
        return 'text-orange-400';
      case 'Shipped':
        return 'text-green-600';
      default:
        return '';
    }
  };

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'ProductName',
      key: 'ProductName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'Quantity',
      key: 'Quantity',
    },
    {
      title: 'Giá',
      dataIndex: 'Price',
      key: 'Price',
      render: (text) => <span className="text-green-600">${text}</span>,
    },
  ];

  if (role === 'Customer') {
    columns.push({
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Button 
          type="primary" 
          onClick={() => openModal(record.ProductID)}
          disabled={order.Status !== 'Shipped'}
        >
          Comment
        </Button>
      ),
    });
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
          <Text strong>Trạng thái:</Text> <Text className={`${getStatusClass(order.Status)}`}>{order.Status}</Text>
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
        
        <Table
          dataSource={orderDetail.Products}
          columns={columns}
          rowKey="ProductID"
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
