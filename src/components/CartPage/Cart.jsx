import { useEffect } from 'react';
import { Table, InputNumber, Button, Typography, Card, Image } from 'antd';
import useShopping from '../../hook/useShopping';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Cart = () => {
  const { shoppingCart, handleUpdateQuantity, handleRemoveItem } = useShopping();
  const navigate = useNavigate();

  // Calculate total amount whenever shoppingCart changes
  const totalAmount = shoppingCart.reduce((total, item) => {
    return total + item.Price * item.quantity;
  }, 0);

  // Save shoppingCart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
  }, [shoppingCart]);

  const columns = [
    {
      title: '#',
      dataIndex: 'ProductID',
      key: 'ProductID',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'ProductName',
      key: 'ProductName',
      render: (text, record) => (
        <div className="flex items-center">
          <Image src={record.ImageURL} alt={record.ProductName} width={80} />
          <span className="text-xl font-semibold">{text}</span><br />
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'Price',
      key: 'Price',
      render: (text) => typeof text === 'number' ? `$${text.toFixed(2)}` : '',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'Quantity',
      render: (text, record) => (
        <InputNumber
          min={1}
          value={text}
          onChange={(value) => handleUpdateQuantity(record.ProductID, value)}
          className="w-24"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text, record) => (
        <Button
          danger
          onClick={() => handleRemoveItem(record.ProductID)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const handlePayClick = () => {
    localStorage.setItem('totalAmount', totalAmount.toFixed(2));
    navigate('/order');
  }

  return (
    <div className={`container px-4 ${shoppingCart.length === 0 ? 'my-40' : 'mt-10 mb-10'}`}>
      <div className="flex flex-row md:flex-row m-5">
          <Button
              onClick={() => navigate(-1)}
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
              icon={<ArrowLeftOutlined />}
              size="large"
          >
              Quay về
          </Button>
      </div>
      <Title className="text-center" level={2}>Shopping Cart</Title>
      <Card className="shadow-lg rounded-lg p-10">
        {shoppingCart.length > 0 ? (
          <Table
            dataSource={shoppingCart}
            columns={columns}
            rowKey="ProductID"
            pagination={false}
          />
        ) : (
          <Text className="text-center text-2xl text-gray-500">Giỏ của bạn đang trống.</Text>
        )}
      </Card>
      {shoppingCart.length > 0 && (
        <div className="mt-8 flex justify-end items-center">
          <Text className="text-2xl text-green-600 mr-4">
            Tổng tiền: ${totalAmount.toFixed(2)}
          </Text>
          <Button type="primary" onClick={handlePayClick}>
            Thanh toán
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cart;
