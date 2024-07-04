// File: pages/cart.jsx
import { useEffect, useState } from 'react';
import { Table, InputNumber, Button, Typography, Card, Image, Skeleton } from 'antd';
import useShopping from '../../hook/useShopping';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
const API_URL = import.meta.env.REACT_APP_API_URL;

const { Title, Text } = Typography;

const Cart = () => {
  const { shoppingCart, handleUpdateQuantity, handleRemoveItem } = useShopping();
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(false); // State for loading spinner
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Fetch product details for items in the cart
  useEffect(() => {
    const fetchCartDetails = async () => {
      setLoading(true); // Start loading spinner
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // fetch product data from product by id
        const fetchedDetails = await Promise.all(
          shoppingCart.map(async (item) => {
            const response = await axios.get(`${API_URL}/api/products/${item.ProductID}`, config);
            return { ...response.data, Quantity: item.Quantity };
          })
        );
        // check if product is available
        setCartDetails(fetchedDetails.filter(product => product.Status === 'Available'));
      } catch (error) {
        console.error('Error fetching cart details:', error);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchCartDetails();
  }, [shoppingCart]);

  const totalAmount = cartDetails.reduce((total, item) => total + item.Price * item.Quantity, 0);

  const columns = [
    {
      title: '#',
      dataIndex: 'ProductID',
      key: 'ProductID',
      render: (text, record, index) => index + 1,
    },
    {
      title: t('product'),
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
      title: t('price'),
      dataIndex: 'Price',
      key: 'Price',
      render: (text) => typeof text === 'number' ? `${text.toLocaleString('en-US')}` : '',
    },
    {
      title: t('quantity'),
      dataIndex: 'Quantity',
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
      title: t('action'),
      key: 'action',
      render: (text, record) => (
        <Button
          danger
          onClick={() => handleRemoveItem(record.ProductID)}
        >
          {t('delete')}
        </Button>
      ),
    },
  ];

  const handlePayClick = () => {
    localStorage.setItem('totalAmount', totalAmount);
    navigate('/order');
  }

  return (
    <div>
      {/* Go back button */}
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
      <div className={`container px-4 ${shoppingCart.length === 0 ? 'my-40' : 'mt-10 mb-10'}`}>
        <Title className="text-center" level={2}>{t('shopping_cart')}</Title>
        {/* List of products */}
        <Card className="shadow-lg rounded-lg">
          {loading ? (
            <Skeleton active />
          ) : (
            cartDetails.length > 0 ? (
              <Table
                dataSource={cartDetails}
                columns={columns}
                rowKey="ProductID"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            ) : (
              <Text className="text-center text-2xl text-gray-500">{t('your_cart_is_empty')}</Text>
            )
          )}
        </Card>
        {/* TotalPrice and purchase button */}
        {cartDetails.length > 0 && (
          <div className="mt-8 flex justify-end items-center">
            <Text className="text-2xl text-green-600 mr-4">
              {t('total_amount')}: {totalAmount.toLocaleString('en-US')}
            </Text>
            <Button type="primary" onClick={handlePayClick}>
              {t('pay')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
