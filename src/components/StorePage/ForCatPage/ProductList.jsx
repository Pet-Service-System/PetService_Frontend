import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row } from 'antd';
import axios from 'axios';
const { Meta } = Card;

const ProductList = () => {
  const [productData, setProductData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/products');
        // Filter products for dogs (PetTypeId: PT001)
        const dogProducts = response.data.filter(product => product.PetTypeId === 'PT002');
        setProductData(dogProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  console.log(productData)

  const handleProductClick = (id) => {
    navigate(`/product-detail/${id}`);
  };

  return (
    <div className="p-36">
      <Row gutter={[16, 16]} justify="center">
        {productData.map((product) => (
          <Col key={product.ProductID} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                product.ImageURL ? (
                  <img alt={product.ProductName} src={product.ImageURL} />
                ) : (
                  <div>No Image</div>
                )
              }
              onClick={() => handleProductClick(product.ProductID)}
            >
              <Meta
                title={product.ProductName}
                description={
                  <>
                    <p>${product.Price}</p>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductList;
