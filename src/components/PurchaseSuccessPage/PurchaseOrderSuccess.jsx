import { Button, Row, Col } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PurchaseOrderSuccess = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <CheckCircleOutlined style={{ fontSize: '200px', color: '#52c41a' }} />
        <h1 className="mt-4 text-6xl font-bold">{t('payment_success')}</h1>
        <p className="mt-2 text-2xl">{t('your_oerder_payment_success')}</p>
        <Row gutter={[16, 16]} justify="center" className="mt-4">
          <Col>
            <Button type="primary" onClick={() => navigate('/')}>
              {t('home')}
            </Button>
          </Col>
          <Col>
            <Button type="primary" onClick={() => navigate('/order-history')}>
              {t('order_history')}
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PurchaseOrderSuccess;
