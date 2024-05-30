import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getForCatProducts } from '../../../apis/ApiProduct';

const ProductList = () => {
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    getForCatProducts().then((data) => {
      setProductData(data);
    });
  }, []);

  const navigate = useNavigate();

  const handleProductClick = (id) => {
    navigate(`/for-cat-product-detail/${id}`);
  };

  return (
    productData && (
      <div className="flex justify-center p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productData.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer transition transform hover:scale-105 duration-300"
              onClick={() => handleProductClick(product.id)}
              style={{ width: '250px' }} // Set a fixed width for the card
            >
              <div className="w-full overflow-hidden" style={{ height: '250px' }}> {/* Set a fixed height for the image container */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 mt-2">${product.price}</p>
                  <p className="text-gray-500 mt-2">{product.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default ProductList;
