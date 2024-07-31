import { Typography, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

const Policy = () => {

  const { t } = useTranslation();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Title level={1} className="text-center mb-8">{t('policy_store')}</Title>

      <Card className="mb-4 p-4">
        <Title level={3}>1. {t('policy_header_1')}</Title>
        <Paragraph>
        {t('policy_detail_1')} <br />
        {t('policy_detail_1.1')}
        </Paragraph>
      </Card>

      <Card className="mb-4 p-4">
        <Title level={3}>2. {t('refund_policy')}</Title>
        <Paragraph>
          {t('refund_detail')}
        </Paragraph>
      </Card>

      <Card className="mb-4 p-4">
        <Title level={3}>3. {t('policy_header_2')}</Title>
        
        <Title level={4}>3.1 {t('cancel_header')}</Title>
        <Paragraph>
          {t('cancel_detail')}
        </Paragraph>
        <ul className="list-disc pl-6">
          <li>
            <strong>{t('cancel_detail_1')}</strong> {t('cancel_detail_1.1')}
          </li>
          <li>
            <strong>{t('cancel_detail_2')}</strong> {t('cancel_detail_2.1')}
          </li>
          <li>
            <strong>{t('cancel_detail_3')}</strong> {t('cancel_detail_3.1')}
          </li>
          <li>
            <strong>{t('cancel_detail_4')}</strong> {t('cancel_detail_4.1')}
          </li>
          <li>
            <strong>{t('cancel_detail_5')}</strong> {t('cancel_detail_5.1')}
          </li>
        </ul>

        <Title level={4}>3.2 {t('cancel_header_1')}</Title>
        <Paragraph>
          {t('cancel_detail_6')}
        </Paragraph>
      </Card>

      <Card className="mb-4 p-4">
        <Title level={3}>4. {t('policy_header_3')}</Title>
        <Paragraph>
        {t('policy_detail_3')}
        </Paragraph>
        <Paragraph>
        {t('policy_detail_3.1')}
        </Paragraph>
      </Card>
    </div>
  );
};

export default Policy;
