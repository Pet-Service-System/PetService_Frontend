import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPetService } from '../../../apis/ApiService';

const ProductList = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getPetService().then((data) => {
      setData(data);
    });
  }, []);

  const navigate = useNavigate();

  const handleProductClick = (id) => {
    navigate(`/pet-service-detail/${id}`);
  };

  return (
    <div className="container mx-auto p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-40">
        {data.map((product) => (
          <div 
            key={product.id} 
            className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer transition transform hover:scale-105 duration-300"
            onClick={() => handleProductClick(product.id)}
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-2/3 h-2/3 object-cover mx-auto" 
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
              <p className="text-gray-600 mt-2">${product.price}</p>
              <p className="text-gray-500 mt-2">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
