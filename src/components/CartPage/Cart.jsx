import { useEffect } from 'react';
import { Table, InputNumber, Button, Typography, Card, Image } from 'antd';
import useShopping from '../../hook/useShopping';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';


const { Title, Text } = Typography;

const Cart = () => {
  const { shoppingCart, handleUpdateQuantity, handleRemoveItem } = useShopping();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Calculate total amount whenever shoppingCart changes
  const totalAmount = shoppingCart.reduce((total, item) => {
    return total + item.Price * item.Quantity;
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
          value={text} // Ensure this is the correct value for each item's quantity
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
    <div className={`container px-4 ${shoppingCart.length === 0 ? 'my-40' : 'mt-10 mb-10'}`}>
      <div className="flex flex-row md:flex-row m-5">
        <Button
          onClick={() => navigate(-1)}
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
          icon={<ArrowLeftOutlined />}
          size="large"
        >
          {t('back')}
        </Button>
      </div>
      <Title className="text-center" level={2}>{t('shopping_cart')}</Title>
      <Card className="shadow-lg rounded-lg">
        {shoppingCart.length > 0 ? (
          <Table
            dataSource={shoppingCart}
            columns={columns}
            rowKey="ProductID"
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Text className="text-center text-2xl text-gray-500">{t('your_cart_is_empty')}</Text>
        )}
      </Card>
      {shoppingCart.length > 0 && (
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
  );
};

export default Cart;