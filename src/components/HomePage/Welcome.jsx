
import { Typography, Card, Row, Col } from 'antd';

const { Title, Text } = Typography;

const Welcome = () => {
  return (
    <div className="text-left py-40 bg-cover bg-center" style={{ backgroundImage: "url(/src/assets/image/petbackground.jpg)" }}>
      <div className="container mx-auto">
        <Row justify="left" align="middle" style={{ minHeight: '35vh' }}>
          <Col>
            <Card className="bg-cyan-500 bg-opacity-90 p-10 rounded-lg shadow-md text-center">
              <Title level={2} className="text-4xl">
                Welcome to <i>Pet Service</i>
              </Title>
              <div id="typed-strings" className="text-lg italic">
                <Text className="text-white">Happy for pets is happy for you.</Text>
              </div>
              <Text id="typed" className="text-lg italic" style={{ whiteSpace: 'pre' }}></Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Welcome;
