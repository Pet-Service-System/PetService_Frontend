import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row } from 'antd';
import { getPetService } from '../../../apis/ApiService';

const { Meta } = Card;

const ServiceList = () => {
  const [serviceData, setServiceData] = useState([]);

  useEffect(() => {
    getPetService().then((data) => {
      setServiceData(data);
    });
  }, []);

  const navigate = useNavigate();

  const handleProductClick = (id) => {
    navigate(`/pet-service-detail/${id}`);
  };

  return (
    <div className="p-5">
      <Row gutter={[16, 16]} justify="center">
        {serviceData.map((product) => (
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

export default ServiceList;
