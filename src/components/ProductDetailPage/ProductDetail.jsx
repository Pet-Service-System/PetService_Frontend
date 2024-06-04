import { useEffect, useState } from 'react';
import useShopping from '../../hook/useShopping';
import { getForCatProductsDetail, getForDogProductsDetail } from '../../apis/ApiProduct';
import { useParams } from 'react-router-dom';

const ProductDetail = ({ type }) => {
    const { id } = useParams();
    const [productData, setProductData] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProductDetail = async () => {
            let data;
            if (type === 'cat') {
                data = await getForCatProductsDetail(id);
            } else if (type === 'dog') {
                data = await getForDogProductsDetail(id);
            }
            setProductData(data);
        };
        fetchProductDetail();
    }, [id, type]);

    const { handleAddItem } = useShopping();

    const handleIncrease = () => setQuantity(quantity + 1);
    const handleDecrease = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

    const handleOrderNow = () => {
        console.log('Ordered:', productData, 'Quantity:', quantity);
    };

    const handleAddToCart = () => {
        if (productData) {
            const productWithQuantity = { ...productData, quantity };
            handleAddItem(productWithQuantity);
        }
    };

    const handleChangeQuantity = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    };

    return (
        productData && (
            <div className="flex flex-col md:flex-row m-5 py-28 px-4 md:px-32">
                <div className="w-full md:w-1/2 flex justify-center">
                    <img 
                        src={productData.image} 
                        alt={productData.name} 
                        className="max-w-full max-h-96 object-contain" 
                    />
                </div>
                <div className="w-full md:w-1/2 p-5 md:ml-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">{productData.name}</h1>
                    <p className="text-xl md:text-2xl text-green-500 mb-4">{`Price: $${productData.price}`}</p>
                    <p className="mb-6">{productData.description}</p>
                    <div className="flex items-center mb-6">
                        <button onClick={handleDecrease} className="bg-gray-600 text-white border border-gray-400 p-2">-</button>
                        <input
                            value={quantity}
                            onChange={handleChangeQuantity}
                            className="mx-3 text-lg w-16 text-center"
                            type="number"
                            min="1"
                        />
                        <button onClick={handleIncrease} className="bg-black text-white border border-gray-400 p-2">+</button>
                    </div>
                    <div className="flex space-x-4 justify-end">
                        <button onClick={handleAddToCart} className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2">Add to Cart</button>
                        <button onClick={handleOrderNow} className="bg-green-500 hover:bg-green-700 text-white px-4 py-2">Order Now</button>
                    </div>
                </div>
            </div>
        )
    );
};

export default ProductDetail;
