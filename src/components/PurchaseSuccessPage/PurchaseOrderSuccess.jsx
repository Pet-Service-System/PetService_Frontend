import { Button, Row, Col } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const PurchaseOrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <CheckCircleOutlined style={{ fontSize: '200px', color: '#52c41a' }} />
        <h1 className="mt-4 text-6xl font-bold">Thanh toán thành công!</h1>
        <p className="mt-2 text-2xl">Đơn hàng của bạn đã được thanh toán thành công.</p>
        <Row gutter={[16, 16]} justify="center" className="mt-4">
          <Col>
            <Button type="primary" onClick={() => navigate('/')}>
              Trang chủ
            </Button>
          </Col>
          <Col>
            <Button type="primary" onClick={() => navigate('/order-history')}>
              Lịch sử đơn hàng
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PurchaseOrderSuccess;
