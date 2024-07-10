import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, Table, Button, Modal, Rate, Input, message, Image } from 'antd';
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import 'tailwindcss/tailwind.css';
import moment from "moment";
import { useTranslation } from 'react-i18next';
const PAYPAL_CLIENT_ID = import.meta.env.REACT_APP_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = import.meta.env.REACT_APP_PAYPAL_CLIENT_SECRET;

const { Title, Text } = Typography;
const { confirm } = Modal;
const API_URL = import.meta.env.REACT_APP_API_URL;
const REACT_APP_SHIPPING_COST = import.meta.env.REACT_APP_SHIPPING_COST

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
  const shippingCost = parseFloat(REACT_APP_SHIPPING_COST)
  const [selectedOrderID, setSelectedOrderID] = useState(null); // State for selected order ID
  const { t } = useTranslation();

  const getOrder = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/orders/${id}`, {
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
      const response = await axios.get(`${API_URL}/api/order-details/order/${id}`, {
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
      const response = await axios.get(`${API_URL}/api/products/${productId}`, {
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
      setSelectedOrderID(orderId); // Set the selected order ID

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
            `${API_URL}/api/orders/${order.OrderID}`,
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
          await processRefund(order.PaypalOrderID);
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

  // Function to update inventory quantities for products
  const updateInventoryQuantities = async (products) => {
    try {
      // Iterate over each product in the order detail
      for (const product of products) {
        const productId = product.ProductID;
        const quantity = product.Quantity;

        // Make API call to get current inventory quantity
        const inventoryResponse = await axios.get(`${API_URL}/api/products/${productId}`);

        if (inventoryResponse.status !== 200) {
          throw new Error(`Failed to fetch inventory for ProductID ${productId}`);
        }

        const currentInventory = inventoryResponse.data.Quantity;

        // Calculate new inventory quantity after cancellation
        const newQuantity = currentInventory + quantity;

        // Make API call to update the inventory
        const updateResponse = await axios.patch(
          `${API_URL}/api/products/${productId}`,
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
        `${API_URL}/api/comments/`,
        {
          ProductID: selectedProductID,
          AccountID: accountID,
          Rating: rating,
          CommentContent: comment.trim(),
          CommentDate: Date(),
          isReplied: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Comment created:', response.data);


      // Update isCommented for the product in the order details
      const updateResponse = await axios.patch(
        `${API_URL}/api/order-details/updateOrderCommentStatus`,
        {
          OrderID: selectedOrderID,
          ProductID: selectedProductID,
          isCommented: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state to disable the comment button
      setOrderDetail((prevOrderDetail) => ({
        ...prevOrderDetail,
        Items: prevOrderDetail.Items.map((item) =>
          item.ProductID === selectedProductID ? { ...item, isCommented: true } : item
        ),
      }));
      
      console.log('Product isCommented updated:', updateResponse.data);
      message.success(t('comment_success'));
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
      render: (text) => <span className="text-green-600">{text.toLocaleString('en-US')}</span>,
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
          disabled={order.Status !== 'Shipped' || isSubmitting ||record.isCommented === true}
          className='min-w-[100px] w-auto px-2 py-1 text-center text-xl'
        >
          {record.isCommented ? t('commented') : t('comment')}
        </Button>
      ),
    });
  }

  return ( orderDetail.Items &&
    <div className="p-4 md:p-8 lg:p-12">
      {/* Go back button */}
      <Button
        onClick={() => navigate(-1)}
        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
        icon={<ArrowLeftOutlined />}
        size="large"
      >
        {t('back')}
      </Button>
      {/* Order history detail */}
      <Card className="p-6 max-w-screen-lg mx-auto mt-4 shadow-lg rounded-lg">
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
          <Text strong>{t('shipping_fee')}: </Text> <Text>{shippingCost.toLocaleString('en-US')}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('total_amount')}:</Text> <Text className="text-green-600">{order.TotalPrice.toLocaleString('en-US')}</Text>
        </div>
        <div className="mb-4">
          <Text strong>{t('order_detail')}:</Text>
        </div>

        {orderDetail.Items &&(
            <Table
            dataSource={orderDetail.Items}
            columns={columns}
            rowKey="ProductID"
            scroll={{ x: 'max-content' }}
            bordered
            />
          )
        }
        
        {/* Render the cancel button conditionally */}
        {(role === 'Customer') && order.Status === 'Processing' && (
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
