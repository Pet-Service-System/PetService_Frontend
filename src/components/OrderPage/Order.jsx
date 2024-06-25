import { useState, useEffect } from 'react';
import { Row, Col, Radio, Typography, Modal, Image, Input, Button, message } from 'antd';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setShoppingCart } from '../../redux/shoppingCart';

const { Title, Text } = Typography;

const Order = () => {
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('nationwide');
  const [orderDetails, setOrderDetails] = useState({
    fullname: '',
    address: '',
    phone: '',
    totalAmount: 0,
    shippingCost: 3,
    cartItems: [],
  });
  const [isPayPalEnabled, setIsPayPalEnabled] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setOrderDetails((prevOrderDetails) => ({
        ...prevOrderDetails,
        fullname: user.fullname,
        address: user.address,
        phone: user.phone,
      }));
    }

    const shoppingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const totalAmount = parseFloat(localStorage.getItem('totalAmount')) || 0;

    setOrderDetails((prevOrderDetails) => ({
      ...prevOrderDetails,
      totalAmount: totalAmount,
      cartItems: shoppingCart,
    }));

    // Enable PayPal button only when order details are ready
    setIsPayPalEnabled(true);
  }, [orderDetails]);

  const handleShippingChange = (e) => {
    const shippingMethod = e.target.value;
    let shippingCost = 3;
    if (shippingMethod === 'local') {
      shippingCost = 0;
    }

    setSelectedShippingMethod(shippingMethod);
    setOrderDetails((prevOrderDetails) => ({
      ...prevOrderDetails,
      shippingCost: shippingCost,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails({
      ...orderDetails,
      [name]: value,
    });
  };

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: (orderDetails.totalAmount + orderDetails.shippingCost).toFixed(2),
        },
      }],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(() => {
      setSuccessModalVisible(true); 
      localStorage.removeItem('shoppingCart');
      dispatch(setShoppingCart([]));
    });
  };

  const closeModal = () => {
    setSuccessModalVisible(false);
    navigate('/'); // Sau khi đóng modal, chuyển hướng về trang chủ
  };

  const onError = (err) => {
    message.error('Đã xảy ra lỗi trong quá trình thanh toán với PayPal.');
    console.error('Error during PayPal checkout:', err);
  };

  return (
    <div>
      <div className="flex flex-row md:flex-row m-5 px-8">
        <Button
          onClick={() => navigate(-1)}
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
          icon={<ArrowLeftOutlined />}
          size="large"
        >
          Quay về
        </Button>
      </div>
      <div className="flex items-center justify-center bg-gray-100 px-10">
        <Row gutter={[16, 16]} className="w-full">
          <Col xs={24} md={16}>
            {/* Delivery Address */}
            <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <Title level={3} className="mb-6">Địa chỉ giao hàng</Title>
              <Text strong>Họ tên:</Text>
              <Input
                name="fullname"
                value={orderDetails.fullname}
                onChange={handleInputChange}
                className="mb-2"
              />
              <br />
              <Text strong>Địa chỉ:</Text>
              <Input
                name="address"
                value={orderDetails.address}
                onChange={handleInputChange}
                className="mb-2"
              />
              <br />
              <Text strong>Số điện thoại:</Text>
              <Input
                name="phone"
                value={orderDetails.phone}
                onChange={handleInputChange}
                className="mb-2"
              />
            </div>
            <div className="p-8 bg-white rounded-lg shadow-md mt-4 md:mb-2">
              <Title level={3} className="mb-6">Danh sách sản phẩm</Title>
              {orderDetails.cartItems.map((item, index) => {
                const totalPrice = (item.Price * item.quantity).toFixed(2);
                return (
                  <Row key={index} className="mb-4" gutter={[16, 16]}>
                    <Col span={4}>
                      <Image 
                        src={item.ImageURL} 
                        alt={item.ProductName} 
                        className="w-16 h-16 object-cover rounded" 
                      />
                    </Col>
                    <Col span={4}>
                      <Text strong>{item.ProductName}</Text>
                    </Col>
                    <Col span={4}>
                      Số lượng: <Text>{item.quantity}</Text>
                    </Col>
                    <Col span={4}>
                      Đơn giá: <Text>${item.Price.toFixed(2)}</Text>
                    </Col>
                    <Col span={4}>
                      Tổng: <Text className='text-green-600'>${totalPrice}</Text>
                    </Col>
                  </Row>
                );
              })}
            </div>
          </Col>

          <Col xs={24} md={8}>
            {/* Shipping Method */}
            <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <Title level={3} className="mb-6">Phương thức vận chuyển</Title>
              <Radio.Group
                value={selectedShippingMethod}
                onChange={handleShippingChange}
              >
                <Radio value="nationwide" className="font-medium block mb-2">Phí vận chuyển Toàn Quốc ($3)</Radio>
              </Radio.Group>
            </div>

            {/* Total Amount */}
            <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <Title level={3} className="mb-6">Tổng tiền</Title>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <Text strong>Thành tiền:</Text>
                  <Text>${orderDetails.totalAmount.toFixed(2)}</Text>
                </div>
                <div className="flex justify-between mb-2">
                  <Text strong>Phí vận chuyển:</Text>
                  <Text>${orderDetails.shippingCost.toFixed(2)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text strong>Tổng số:</Text>
                  <Text className="text-2xl text-green-600">
                    ${(orderDetails.totalAmount + orderDetails.shippingCost).toFixed(2)}
                  </Text>
                </div>
              </div>
              <div className="text-right">
                {/* PayPal Buttons */}
                {isPayPalEnabled && (
                  <PayPalButtons
                    createOrder={createOrder}
                    onApprove={(data, actions) => onApprove(data, actions)}
                    onError={(err) => onError(err)}
                  />
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Success Modal */}
      <Modal
        title="Thanh toán thành công"
        visible={successModalVisible}
        footer={[
          <Button key="back" type='primary' onClick={closeModal}>
            Về trang chủ
          </Button>,
        ]}
      >
        <p><CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '10px' }} /> Đơn hàng của bạn đã được thanh toán thành công!</p>
      </Modal>
    </div>
  );
};

export default Order;
