import axios from "axios";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, Table, Button, Modal, Rate, Input, message, Image } from 'antd';
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import 'tailwindcss/tailwind.css';
import moment from "moment";

const { Title, Text } = Typography;
const { confirm } = Modal;

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
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
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
          message.success('Đơn hàng đã được hủy thành công.');
        } catch (error) {
          console.error('Error cancelling order:', error);
          message.error('Đã xảy ra lỗi khi hủy đơn hàng.');
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
      message.error('Đã xảy ra lỗi khi cập nhật số lượng tồn kho.');
    }
  };


  const handleSubmit = async () => {
    if (rating === 0) {
      message.warning('Vui lòng đánh giá.');
      return;
    }
    if (comment.trim() === '') {
      message.warning('Vui lòng để lại nhận xét.');
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
      console.log('Bình luận thành công:', response.data);
      message.success('Bình luận thành công!');
      fetchOrderDetails(id); // Refresh comments
    } catch (error) {
      if (error.response && error.response.status === 404) {
        message.error(`Bạn đã đánh giá sản phẩm này.`);
      } else {
        console.error('Lỗi khi tạo bình luận:', error);
        message.error('Không thể tạo bình luận.');
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
      title: 'Hình ảnh',
      dataIndex: 'ImageURL',
      key: 'ImageURL',
      render: (text, record) => (
        <div className="flex items-center">
          <Image src={record.ImageURL} alt={record.ProductName} width={80} />
        </div>
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'ProductName',
      key: 'ProductName',
      render: (text, record) => (
        <Link className="text-blue-500 hover:text-blue-800" to={`/product-detail/${record.ProductID}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'Quantity',
      key: 'Quantity',
      render: (text, record) => <span>{record.Quantity}</span>,
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
          disabled={order.Status !== 'Shipped' || isSubmitting} // Disable when not shipped or submitting
        >
          Đánh giá
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
          <Text strong>Ngày đặt hàng:</Text> <Text>{moment(order.date).format('DD/MM/YYYY HH:mm')}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Trạng thái:</Text> <Text className={`${getStatusClass(order.Status)}`}>{order.Status}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Tên khách hàng:</Text> <Text>{orderDetail.CustomerName}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Số điện thoại:</Text> <Text>{orderDetail.Phone}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Địa chỉ:</Text> <Text>{orderDetail.Address}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Phí ship: </Text> <Text>$2</Text>
        </div>
        <div className="mb-4">
          <Text strong>Tổng giá:</Text> <Text className="text-green-600">${order.TotalPrice}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Chi tiết đơn hàng:</Text>
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
            Hủy đơn hàng
          </Button>
        )}

        <Modal
          title="Đánh giá đơn hàng"
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="cancel" onClick={() => setShowModal(false)}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmit} disabled={isSubmitting}>
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
