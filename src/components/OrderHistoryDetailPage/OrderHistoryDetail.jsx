import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, Table, Button, Modal, Rate, Input, message, Image } from 'antd';
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import 'tailwindcss/tailwind.css';
import moment from "moment";
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { confirm } = Modal;

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
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit status
  const navigate = useNavigate();
  const accountID = JSON.parse(localStorage.getItem('user')).id;
  const role = localStorage.getItem('role')

  useEffect(() => {
    fetchOrderDetails(id);
  }, [id]);

  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);

      const orderDetailData = await getOrderDetail(orderId);
      setOrderDetail(orderDetailData);

      // Fetch product details for each product in order detail
      const productsWithDetails = await Promise.all(
        orderDetailData.Items.map(async (product) => {
          const productDetails = await getProductById(product.ProductID);
          return {
            ...product,
            ProductName: productDetails.ProductName,
            Price: productDetails.Price,
            Quantity: product.Quantity,
            ImageURL: productDetails.ImageURL
          };
        })
      );

      setOrderDetail({ ...orderDetailData, Items: productsWithDetails });
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

  const handleCancelOrder = async () => {
    confirm({
      title: t('cofirm_cancel_order'),
      icon: <ExclamationCircleOutlined />,
      content: t('are_you_sure_cancel_order'),
      okText: t('agree'),
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          // Make API call to update order status to 'Canceled'
          const response = await axios.put(
            `http://localhost:3001/api/orders/${order.OrderID}`,
            { Status: 'Canceled' },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status !== 200) {
            throw new Error(`Failed to cancel order ${order.OrderID}`);
          }

          // Update inventory quantities for each product in order detail
          await updateInventoryQuantities(orderDetail.Items);

          // Fetch updated order details
          fetchOrderDetails(order.OrderID);

          // Show success message
          message.success(t('success_cancel_order'));
        } catch (error) {
          console.error('Error cancelling order:', error);
          message.error(t('error_occur_cancel_order'));
        }
      },
    });
  };

  // Function to update inventory quantities for products
  const updateInventoryQuantities = async (products) => {
    try {
      // Iterate over each product in the order detail
      for (const product of products) {
        const productId = product.ProductID;
        const quantity = product.Quantity;

        // Make API call to get current inventory quantity
        const inventoryResponse = await axios.get(`http://localhost:3001/api/products/${productId}`);

        if (inventoryResponse.status !== 200) {
          throw new Error(`Failed to fetch inventory for ProductID ${productId}`);
        }

        const currentInventory = inventoryResponse.data.Quantity;

        // Calculate new inventory quantity after cancellation
        const newQuantity = currentInventory + quantity;

        // Make API call to update the inventory
        const updateResponse = await axios.patch(
          `http://localhost:3001/api/products/${productId}`,
          { Quantity: newQuantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (updateResponse.status !== 200) {
          throw new Error(`Failed to update inventory for ProductID ${productId}`);
        }

        console.log(`Inventory updated successfully for ProductID ${productId}`);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      message.error(t('error_occur_update_product_quantity'));
    }
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

    setIsSubmitting(true); // Start submitting
    message.warning('Đang xử lý...')
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
      setIsSubmitting(false); // End submitting
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
      title: t('image'),
      dataIndex: 'ImageURL',
      key: 'ImageURL',
      render: (text, record) => (
        <div className="flex items-center">
          <Image src={record.ImageURL} alt={record.ProductName} width={80} />
        </div>
      ),
    },
    {
      title: t('product_name'),
      dataIndex: 'ProductName',
      key: 'ProductName',
      render: (text, record) => (
        <Link className="text-blue-500 hover:text-blue-800" to={`/product-detail/${record.ProductID}`}>
          {text}
        </Link>
      ),
    },
    {
      title: t('quantity'),
      dataIndex: 'Quantity',
      key: 'Quantity',
      render: (text, record) => <span>{record.Quantity}</span>,
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
          disabled={order.Status !== 'Shipped' || isSubmitting} // Disable when not shipped or submitting
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
          <Text strong>{t('order_date')}:</Text> <Text>{moment(order.date).format('DD/MM/YYYY HH:mm')}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('status')}:</Text> <Text className={`${getStatusClass(order.Status)}`}>{order.Status}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('customer_name')}:</Text> <Text>{orderDetail.CustomerName}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('phone_number')}:</Text> <Text>{orderDetail.Phone}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('address')}:</Text> <Text>{orderDetail.Address}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('shipping_fee')}: </Text> <Text>$2</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('total_amount')}:</Text> <Text className="text-green-600">${order.TotalPrice}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('order_detail')}:</Text>
        </div>

        <Table
          dataSource={orderDetail.Items}
          columns={columns}
          rowKey="ProductID"
          scroll={{ x: 'max-content' }}
          bordered
        />
        {/* Render the cancel button conditionally */}
        {(role === 'Customer' || role === 'Sales Staff') && order.Status === 'Processing' && (
          <Button danger className="float-end" onClick={handleCancelOrder} disabled={isSubmitting}>
            {t('cancel_order')}
          </Button>
        )}

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
