import { Table, InputNumber, Button, Typography, Card } from 'antd';
import useShopping from '../../hook/useShopping';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Cart = () => {
    const { shoppingCart, handelUpdateQuantity, handleRemoveItem } = useShopping();
    const navigate = useNavigate();

    // Calculate the total amount of the cart
    const totalAmount = shoppingCart.reduce((total, item) => {
        return total + item.Price * item.quantity; // Use 'Price' property for price calculation
    }, 0);

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
                    <div
                        className="w-20 h-20 bg-cover bg-center rounded mr-4"
                        style={{ backgroundImage: `url(${record.ImageURL})` }}
                    ></div>
                    <span className="text-xl font-semibold">{text}</span>
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
                    onChange={(value) => handelUpdateQuantity(record.ProductID, value)}
                    className="w-24"
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (text, record) => (
                <Button
                    type="primary"
                    danger
                    onClick={() => handleRemoveItem(record.ProductID)}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-44">
            <Title className="text-center" level={2}>Shopping Cart</Title>
            <Card className="shadow-lg rounded-lg p-6">
                {shoppingCart && shoppingCart.length > 0 ? (
                    <Table
                        dataSource={shoppingCart}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                    />
                ) : (
                    <Text className="text-center text-2xl text-gray-500">Giỏ của bạn đang trống.</Text>
                )}
            </Card>
            {shoppingCart && shoppingCart.length > 0 && (
                <div className="mt-8 flex justify-end items-center">
                    <Text className="text-2xl text-green-600 font-bold mr-4">Tổng tiền: ${totalAmount.toFixed(2)}</Text>
                    <Button type="primary" 
                            className="bg-orange-500 
                                       hover:bg-orange-700 
                                       text-white font-bold py-2 px-4 rounded"
                            onClick={() => navigate('/payment')}>
                        Thanh toán
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Cart;
