import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getForDogProducts } from '../../../apis/ApiProduct';
import { Card, Col, Row } from 'antd';

const { Meta } = Card;

const HotelList = () => {
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    getForDogProducts().then((data) => {
      setProductData(data);
    });
  }, []);

  const navigate = useNavigate();

  const handleProductClick = (id) => {
    navigate(`/for-dog-product-detail/${id}`);
  };

  return (
    <div className="p-5">
      <Row gutter={[16, 16]} justify="center">
        {productData.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={<img alt={product.name} src={product.image} />}
              onClick={() => handleProductClick(product.id)}
            >
              <Meta
                title={product.name}
                description={
                  <>
                    <p>${product.price}</p>
                    <p>{product.description}</p>
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

export default HotelList;
