import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image } from 'antd';
import useShopping from '../../hook/useShopping';

const ProductDetail = () => {
    const { id } = useParams();
    const [productData, setProductData] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/products/${id}`);
                setProductData(response.data); // Ensure that the response data matches the schema
            } catch (error) {
                console.error('Error fetching product detail:', error);
            }
        };
        fetchProductDetail();
    }, [id]);

    const handleIncrease = () => setQuantity(quantity + 1);
    const handleDecrease = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

    const handleOrderNow = () => {
        console.log('Ordered:', productData, 'Quantity:', quantity);
    };

    const { handleAddItem } = useShopping();

    const handleAddToCart = () => {
        if (productData) {
            const productWithQuantity = { ...productData, quantity };
            handleAddItem(productWithQuantity);
        }
    };

    const handleChangeQuantity = (value) => {
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    };

    return (
        productData && (
            <div className="flex flex-col md:flex-row m-5 py-28 px-4 md:px-32">
                <div className="w-full md:w-1/2 flex justify-center">
                    <Image src={productData.ImageURL} alt={productData.ProductName} />
                </div>
                <div className="w-full md:w-1/2 p-5 md:ml-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">{productData.ProductName}</h1>
                    <p className="text-xl md:text-2xl text-green-500 mb-4">{`Price: $${productData.Price}`}</p>
                    <p className="mb-6">{productData.Description}</p>
                    <div className="flex items-center mb-6">
                        <Button onClick={handleDecrease}>-</Button>
                        <Input
                            value={quantity}
                            onChange={(e) => handleChangeQuantity(e.target.value)}
                            className="mx-3 text-lg w-24 text-center"
                            type="number"
                            min="1"
                        />
                        <Button onClick={handleIncrease}>+</Button>
                    </div>
                    <div className="flex space-x-4 justify-end">
                        <Button type="primary" onClick={handleAddToCart}>Thêm vào giỏ hàng</Button>
                        <Button type="primary" onClick={handleOrderNow}>Đặt ngay</Button>
                    </div>
                </div>
            </div>
        )
    );
};

export default ProductDetail;
