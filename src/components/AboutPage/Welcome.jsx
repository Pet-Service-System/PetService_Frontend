
import { Row, Col, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Welcome = () => {
  return (
    <div className="bg-gray-200">
      <div className="container mx-auto px-4 py-12">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="flex justify-center">
              <div className="w-full">
                <img src="/src/assets/image/Team.jpg" alt=" " className="w-full h-auto" />
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="ml-4 px-20 text-justify">
              <Title level={2} className="text-red-500">Giới thiệu</Title>
              <Paragraph>
                PET SERVICE ra đời với mong muốn mang lại cho khách hàng sự chuyên nghiệp, uy tín mang nét đẹp hoa mỹ mà chúng tôi đem lại sự trải nghiệm tốt nhất cho thú cưng của chúng ta. Với hơn 5 năm kinh nghiệm trong ngành dịch vụ thú cưng bao gồm: Thú y, Spa thú cưng, Khách sạn thú cưng, Cung cấp các dòng thú cưng chuyên nghiệp...
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Welcome;
