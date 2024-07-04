import { Card, Typography, Image, Spin } from 'antd';
import { ProductOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
const API_URL = import.meta.env.REACT_APP_API_URL;

const { Title } = Typography;

const Statistics = () => {
  const [mostOrderedProducts, setMostOrderedProducts] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading state
  const { t } = useTranslation();

  const fetchMostOrderedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/most-ordered-products`);
      setMostOrderedProducts(response.data);
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error('Error fetching top products:', error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  useEffect(() => {
    fetchMostOrderedProducts();
  }, []);

  return (
    <div className="p-10 bg-cyan-400">
      <Card className="shadow-lg w-full">
        <div className="flex flex-col items-center">
          <div className="flex flex-row mb-4 items-center">
            <ProductOutlined className="text-7xl mr-16" />
            <Title className="mr-8 mb-0 text-gray">
              {t('mostPopularProduct')}
            </Title>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Spin size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {mostOrderedProducts.length === 0 ? (
                <div className="text-center text-gray-500">
                  {t('noDataAvailable')}
                </div>
              ) : (
                mostOrderedProducts.map((product) => (
                  <Card
                    key={product._id}
                    hoverable
                    className="bg-white rounded-lg shadow-md transition-transform transform-gpu hover:scale-105"
                  >
                    <Link to={`/product-detail/${product._id}`}>
                      <Image
                        alt={product.ProductName}
                        src={product.ImageURL}
                        preview={false}
                        className="rounded-t-lg w-full h-44 object-cover"
                        style={{ width: '100%', height: '250px' }}
                      />
                    </Link>
                    <div className="p-4">
                      <h3 className="text-2xl font-semibold">
                        {product.ProductName}
                      </h3>
                      <h2 className="text-green-600 mt-2 text-4xl">
                        {product.Price.toLocaleString('en-US')}
                      </h2>
                      <p className="text-gray-500 mt-2">{product.Description}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Statistics;
