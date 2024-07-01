import { Form, Input, Button, Typography, message } from 'antd';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const ResetPasswordForm = () => {
  const { accountId, token } = useParams();
  const navigate = useNavigate();
  console.log(accountId);
  const { t } = useTranslation();

  const handleSubmit = async (values) => {
    const { password } = values;
    try {
      const response = await axios.post(`http://localhost:3001/api/auth/reset-password/${accountId}/${token}`, {
        newPassword: password,
      });
      message.success(response.data.message);
      navigate('/login');
    } catch (error) {
      console.error('Error during password reset:', error);
      message.error(error.response?.data?.message || t('password_reset_error'));
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-lg w-full p-8 border rounded-lg shadow-md">
        <Title level={3} className="text-center mb-6">{t('reset_password')}</Title>
        <Form
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            label={t('new_password')}
            name="password"
            rules={[{ required: true, message: t('please_enter_new_password') }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label={t('confirm_new_password')}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: t('please_confirm_new_password') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('passwords_do_not_match')));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('reset_password')}
            </Button>
            <Link to="/login">
              <Button type="default" htmlType="button" block style={{ marginTop: '10px' }}>
                {t('cancel')}
              </Button>
            </Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
