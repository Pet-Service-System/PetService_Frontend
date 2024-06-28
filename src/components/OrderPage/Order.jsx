import { useState, useEffect } from 'react';
import { Row, Col, Radio, Typography, Modal, Image, Input, Button, message } from 'antd';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setShoppingCart } from '../../redux/shoppingCart';
import axios from 'axios';
import { useTranslation } from 'react-i18next';



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
  const { t } = useTranslation();

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

  const onApprove = async (data, actions) => {
    try {
      await actions.order.capture();
      setSuccessModalVisible(true);
      localStorage.removeItem('shoppingCart');
      dispatch(setShoppingCart([]));
      const user = JSON.parse(localStorage.getItem('user'))
      const AccountID = user.id
      // Define order data
      const orderData = {
        Status: 'Processing',
        TotalPrice: orderDetails.totalAmount,
        AccountID: AccountID,
        OrderDate: new Date().toLocaleDateString('en-GB')
      };
      // Call the createOrder API using Axios
      const orderResponse = await axios.post('http://localhost:3001/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Order created:', orderResponse.data);

      const orderDetailsData = {
        OrderID: orderResponse.data.OrderID,
        CustomerName: orderDetails.fullname,
        Address: orderDetails.address,
        Phone: orderDetails.phone,
        Products: orderDetails.cartItems.map(item => ({
          ProductID: item.ProductID,
          Quantity: item.quantity
        }))
      };
      const detailsResponse = await axios.post('http://localhost:3001/api/order-details', orderDetailsData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add authorization header if needed
        }
      });

      console.log('Order details created:', detailsResponse.data);

    } catch (error) {
      console.error('Error during PayPal checkout:', error);
      // Handle error
      message.error('Đã xảy ra lỗi trong quá trình thanh toán với PayPal.');
    }
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
          {t('back')}
        </Button>
      </div>
      <div className="flex items-center justify-center bg-gray-100 px-10">
        <Row gutter={[16, 16]} className="w-full">
          <Col xs={24} md={16}>
            {/* Delivery Address */}
            <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <Title level={3} className="mb-6">{t('delivery_address')}</Title>
              <Text strong>{t('fullname')}:</Text>
              <Input
                name="CustomerName"
                value={orderDetails.fullname}
                onChange={handleInputChange}
                className="mb-2"
              />
              <br />
              <Text strong>{t('adress')}:</Text>
              <Input
                name="Address"
                value={orderDetails.address}
                onChange={handleInputChange}
                className="mb-2"
              />
              <br />
              <Text strong>{t('phone')}:</Text>
              <Input
                name="Phone"
                value={orderDetails.phone}
                onChange={handleInputChange}
                className="mb-2"
              />
            </div>
            <div className="p-8 bg-white rounded-lg shadow-md mt-4 md:mb-2">
              <Title level={3} className="mb-6">{t('list_of_product')}</Title>
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
                      {t('quantity')}: <Text>{item.quantity}</Text>
                    </Col>
                    <Col span={4}>
                      {t('unit_price')}: <Text>${item.Price.toFixed(2)}</Text>
                    </Col>
                    <Col span={4}>
                      {t('total')}: <Text className='text-green-600'>${totalPrice}</Text>
                    </Col>
                  </Row>
                );
              })}
            </div>
          </Col>

          <Col xs={24} md={8}>
            {/* Shipping Method */}
            <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <Title level={3} className="mb-6">{t('shipping_method')}</Title>
              <Radio.Group
                value={selectedShippingMethod}
                onChange={handleShippingChange}
              >
                <Radio value="nationwide" className="font-medium block mb-2">{t('shipping_fee_nationwide')} ($3)</Radio>
              </Radio.Group>
            </div>

            {/* Total Amount */}
            <div className="p-8 bg-white rounded-lg shadow-md mb-4 mt-4">
              <Title level={3} className="mb-6">{t('total_amount')}</Title>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <Text strong>{t('total_2')}:</Text>
                  <Text>${orderDetails.totalAmount.toFixed(2)}</Text>
                </div>
                <div className="flex justify-between mb-2">
                  <Text strong>{t('shipping_fee')}:</Text>
                  <Text>${orderDetails.shippingCost.toFixed(2)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text strong>{t('total_3')}:</Text>
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
            {t('return_to_home_page')}
          </Button>,
        ]}
      >
        <p><CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '10px' }} /> Đơn hàng của bạn đã được thanh toán thành công!</p>
      </Modal>
    </div>
  );
};

export default Order;
