import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, Table, Button, Modal, Rate, Input, message } from 'antd';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';
import 'tailwindcss/tailwind.css';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;



const getOrder = async (id) => {
  const token = localStorage.getItem('token');
  const { t } = useTranslation();
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

// Function to fetch product details by ID
const getProductById = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:3001/api/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Assuming API returns product details
  } catch (error) {
    console.error('Error fetching product details:', error);
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

      // Fetch product details for each product in order detail
      const productsWithDetails = await Promise.all(
        detailData.Products.map(async (product) => {
          const productDetails = await getProductById(product.ProductID);
          return { ...product, ...productDetails };
        })
      );
      setOrderDetail({ ...detailData, Products: productsWithDetails });
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
      message.warning(t('pl_rate'));
      return;
    }
    if (comment.trim() === '') {
      message.warning(t('pl_commnet'));
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
      message.success(t('comment_success'));
      fetchOrderDetails(id); // Refresh comments
    } catch (error) {
      if (error.response && error.response.status === 404) {
        message.error(t('already_comment'));
      } else {
        console.error('Error creating comment:', error);
        message.error(t('comment_fail'));
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
      title: t('product_name'),
      dataIndex: 'ProductName',
      key: 'ProductName',
    },
    {
      title: t('quantity'),
      dataIndex: 'Quantity',
      key: 'Quantity',
    },
    {
      title: t('price'),
      dataIndex: 'Price',
      key: 'Price',
      render: (text) => <span className="text-green-600">${text}</span>,
    },
  ];

  if (role === 'Customer') {
    columns.push({
      title: t('actions'),
      key: 'action',
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => openModal(record.ProductID)}
          disabled={order.Status !== 'Shipped'}
        >
          {t('comment')}
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
       {t('back')}
      </Button>
      <Card className="p-6 max-w-4xl mx-auto mt-4 shadow-lg rounded-lg">
        <Title level={2} className="mb-4 text-center">{t('order_detail')} #{order.OrderID}</Title>
        <div className="mb-4">
          <Text strong>{t('order_date')}:</Text> <Text>{new Date(order.OrderDate).toLocaleDateString()}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('status')}:</Text> <Text className={`${getStatusClass(order.Status)}`}>{order.Status}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('customer_name')}:</Text> <Text>{order.CustomerName}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('phone')}:</Text> <Text>{order.Phone}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('adress')}:</Text> <Text>{order.Address}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('total_amount')}:</Text> <Text className="text-green-600">${order.TotalPrice}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('order_detail')}:</Text>
        </div>

        <Table
          dataSource={orderDetail.Products}
          columns={columns}
          rowKey="ProductID"
          bordered
        />

        <Modal
          title={t('rate_order')}
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="cancel" onClick={() => setShowModal(false)}>
              {t('cancel')}
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmit}>
              {t('rate')}
            </Button>,
          ]}
        >
          <Rate onChange={(value) => setRating(value)} value={rating} />
          <Input.TextArea
            placeholder={t('enter_your_comment')}
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
