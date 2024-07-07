import { Row, Col, Typography, Image } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;


const About = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-gray-200">
      <div className="container mx-auto px-4 py-12">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="flex justify-center">
              <div className="w-full">
                <Image preview={false} src="https://res.cloudinary.com/dbaoct3be/image/upload/v1720326895/z5609830475267_b28fcc553a85da413bbac73fd71cc330_wi5h3c.jpg" alt=" " className="w-full h-auto" />
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="ml-4 px-20 text-justify">
              <Title level={2} className="text-red-500">{t('introduction_title')}</Title>
              <Paragraph>
                {t('introduction_paragraph')}
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default About;
