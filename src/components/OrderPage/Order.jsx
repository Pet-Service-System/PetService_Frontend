import { useState, useEffect } from 'react';
import { Row, Col, Radio, Typography, Image, Input, Button, message } from 'antd';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setShoppingCart } from '../../redux/shoppingCart';
import axios from 'axios';

const { Title, Text } = Typography;

const Order = () => {
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('nationwide');
  const [orderDetails, setOrderDetails] = useState({
    totalAmount: 0,
    shippingCost: 2,
    cartItems: JSON.parse(localStorage.getItem('shoppingCart')) || [], // Load cartItems from localStorage
  });
  const [customerInfo, setCustomerInfo] = useState({
    fullname: '',
    address: '',
    phone: '',
  });
  const [isPayPalEnabled, setIsPayPalEnabled] = useState(false);
  const [editMode, setEditMode] = useState(false); // State for edit mode
  const [originalCustomerInfo, setOriginalCustomerInfo] = useState({}); // State to store original values
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const addressInfo = JSON.parse(localStorage.getItem('addressInfo'));
    if (addressInfo) {
      setCustomerInfo(addressInfo);
      setOriginalCustomerInfo(addressInfo); 
    }
  }, []);
  useEffect(() => {
    const totalAmount = parseFloat(localStorage.getItem('totalAmount')) || 0;
    setOrderDetails((prevOrderDetails) => ({
      ...prevOrderDetails,
      totalAmount: totalAmount,
    }));
  
    setIsPayPalEnabled(true);
  }, []); 

  const handleShippingChange = (e) => {
    const shippingMethod = e.target.value;
    let shippingCost = 2;
    if (shippingMethod === 'local') {
      shippingCost = 0;
    }

    setSelectedShippingMethod(shippingMethod);
    setOrderDetails({
      ...orderDetails,
      shippingCost: shippingCost,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prevCustomerInfo => ({
      ...prevCustomerInfo,
      [name]: value,
    }));
  
    // Update localStorage immediately with the updated customerInfo
    localStorage.setItem('addressInfo', JSON.stringify({
      ...customerInfo, // Use current state here as setCustomerInfo is async
      [name]: value,
    }));
  };
  

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const saveChanges = () => {
    localStorage.setItem('addressInfo', JSON.stringify(customerInfo));
    setOriginalCustomerInfo(customerInfo); // Update originalCustomerInfo with current state
    setEditMode(false);
    window.location.reload();
  };
  
  const cancelEdit = () => {
    setCustomerInfo(originalCustomerInfo); // Revert to original state
    setEditMode(false);
  };
  

  const updateInventoryQuantity = async (orderDetails) => {
    try {
      // Iterate over each product in the order details
      for (const item of orderDetails.cartItems) {
        // Make an API call to get current inventory quantity
        const inventoryResponse = await axios.get(`http://localhost:3001/api/products/${item.ProductID}`);

        if (inventoryResponse.status !== 200) {
          throw new Error(`Failed to fetch inventory for ProductID ${item.ProductID}`);
        }

        const currentInventory = inventoryResponse.data.Quantity;

        // Validate item.Quantity and item.quantity before proceeding
        if (typeof item.Quantity !== 'number') {
          throw new Error(`Invalid quantity data for ProductID ${item.ProductID}`);
        }

        // Check if there is sufficient inventory
        if (currentInventory < item.Quantity) {
          throw new Error(`Not enough inventory available for ProductID ${item.ProductID}`);
        }

        // Calculate the new quantity after purchase
        const newQuantity = currentInventory - item.Quantity;

        // Make an API call to update the inventory
        const response = await axios.patch(`http://localhost:3001/api/products/${item.ProductID}`, {
          Quantity: newQuantity
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status !== 200) {
          throw new Error(`Failed to update inventory for ProductID ${item.ProductID}`);
        }

        console.log(`Inventory updated successfully for ProductID ${item.ProductID}`);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      // Handle error appropriately, e.g., show a message to the user
      message.error('Đã xảy ra lỗi khi cập nhật số lượng tồn kho.');
    }
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
      if (orderDetails.cartItems.length === 0) {
        throw new Error('Không có sản phẩm trong đơn hàng.');
      }
      await actions.order.capture();
      // Define order data
      const orderData = {
        Status: 'Processing',
        TotalPrice: orderDetails.totalAmount + orderDetails.shippingCost,
        AccountID: JSON.parse(localStorage.getItem('user')).id,
        OrderDate: new Date(), 
      };

      // Call the createOrder API using Axios
      const orderResponse = await axios.post('http://localhost:3001/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Order created:', orderResponse.data);

      const addressInfo = JSON.parse(localStorage.getItem('addressInfo'));
      if (addressInfo) {
        setCustomerInfo({
          fullname: addressInfo.fullname,
          address: addressInfo.address,
          phone: addressInfo.phone,
        });
      }

      const orderDetailsData = {
        OrderID: orderResponse.data.OrderID,
        CustomerName: customerInfo.fullname,
        Address: customerInfo.address,
        Phone: customerInfo.phone,
        Items: orderDetails.cartItems.map(item => ({
          ProductID: item.ProductID,
          Quantity: item.Quantity
        }))
      };
      
      const detailsResponse = await axios.post('http://localhost:3001/api/order-details', orderDetailsData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add authorization header if needed
        }
      });

      console.log('Order details created:', detailsResponse.data);

      await updateInventoryQuantity(orderDetails);

      setTimeout(() => {
        localStorage.removeItem('shoppingCart');
        dispatch(setShoppingCart([]));
        navigate('/purchase-order-successfully', { replace: true });
      }, 700);

    } catch (error) {
      console.error('Error during PayPal checkout:', error);
      // Handle error
      message.error('Đã xảy ra lỗi trong quá trình thanh toán với PayPal.');
    }
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
              <div className="flex justify-between items-center mb-6">
                <Title level={3} className="mb-0">
                  Địa chỉ giao hàng
                </Title>
                {!editMode ? (
                  <Button onClick={toggleEditMode} icon={<EditOutlined />} type="text">
                    Sửa
                  </Button>
                ) : (
                  <div>
                    <Button onClick={saveChanges} icon={<SaveOutlined />} type="primary" className="mr-2">
                      Lưu
                    </Button>
                    <Button onClick={cancelEdit} icon={<CloseOutlined />} type="default">
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
              <Text strong>Họ tên:</Text>
              <Input
                name="fullname"
                value={customerInfo.fullname}
                onChange={handleInputChange}
                className="mb-2"
                disabled={!editMode} // Disable input if not in edit mode
              />
              <br />
              <Text strong>Địa chỉ:</Text>
              <Input
                name="address"
                value={customerInfo.address}
                onChange={handleInputChange}
                className="mb-2"
                disabled={!editMode} // Disable input if not in edit mode
              />
              <br />
              <Text strong>Số điện thoại:</Text>
              <Input
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                className="mb-2"
                disabled={!editMode} // Disable input if not in edit mode
              />
            </div>
            <div className="p-8 bg-white rounded-lg shadow-md mt-4 md:mb-2">
              <Title level={3} className="mb-6">Danh sách sản phẩm</Title>
              {orderDetails.cartItems.map((item, index) => {
                const totalPrice = (item.Price * item.Quantity).toFixed(2);
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
                      Số lượng: <Text>{item.Quantity}</Text>
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
                {(isPayPalEnabled && !editMode) &&  (
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
    </div>
  );
};

export default Order;