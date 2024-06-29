import { Button, Form, Input, Typography, Row, Col, message } from 'antd'; // Import message từ antd
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


const { Title } = Typography;

const RegisterForm = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // State để điều khiển trạng thái của nút Đăng ký
  const [disableRegister, setDisableRegister] = useState(false); // State để điều khiển việc vô hiệu hóa nút Đăng ký
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validate = () => {
    const newErrors = {};
    if (!fullname) newErrors.fullname = t('fullname_required');
    if (!email) newErrors.email = t('email_required');
    if (!password) newErrors.password = t('password_required');
    if (password !== confirmPassword) newErrors.confirmPassword = t('passwords_do_not_match');
    if (!phoneNumber) newErrors.phoneNumber = t('phone_number_required');
    if (!address) newErrors.address = t('address_required');
    return newErrors;
  };

  useEffect(() => {
    let timer;
    if (disableRegister) {
      timer = setTimeout(() => {
        setDisableRegister(false);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [disableRegister]);

  const handleSubmit = async () => {
    if (disableRegister) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true);
        const response = await axios.post('http://localhost:3001/api/auth/register', {
          fullname: fullname,
          password: password,
          email: email,
          phone: phoneNumber,
          address: address,
          status: 'active',
          role: 'Customer',
        });

        message.success(t('registration_successful'), 2).then(() => {
          navigate('/login');
        });
        setDisableRegister(true);
        console.log(t('registration_successful'), response.data);
      } catch (error) {
        if (error.response) {
          message.error(error.response.data.message);
        } else {
          message.error(t('registration_error'));
        }
        setDisableRegister(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Row justify="center" style={{ minHeight: '100vh', alignItems: 'center' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8} className="px-10 py-10">
        <div className="p-6 md:p-12 bg-white rounded-lg shadow-md">
          <Title level={3} className="text-blue-500 text-center mb-4">{t('register')}</Title>
          <Form onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label={t('fullname')}
              name="fullname"
              validateStatus={errors.fullname && 'error'}
              help={errors.fullname}
            >
              <Input
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                name="fullname"
              />
            </Form.Item>
            <Form.Item
              label={t('email')}
              name="email"
              validateStatus={errors.email && 'error'}
              help={errors.email}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                autoComplete="email"
              />
            </Form.Item>
            <Form.Item
              label={t('password')}
              name="password"
              validateStatus={errors.password && 'error'}
              help={errors.password}
            >
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
              />
            </Form.Item>
            <Form.Item
              label={t('confirm_password')}
              name="confirmPassword"
              validateStatus={errors.confirmPassword && 'error'}
              help={errors.confirmPassword}
            >
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                name="confirmPassword"
              />
            </Form.Item>
            <Form.Item
              label={t('phone_number')}
              name="phoneNumber"
              validateStatus={errors.phoneNumber && 'error'}
              help={errors.phoneNumber}
            >
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                name="phoneNumber"
              />
            </Form.Item>
            <Form.Item
              label={t('address')}
              name="address"
              validateStatus={errors.address && 'error'}
              help={errors.address}
            >
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                name="address"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full" disabled={isLoading || disableRegister}>
                {disableRegister ? t('registering') : t('register')}
              </Button>
            </Form.Item>
          </Form>
          <div className="text-center mt-4">
            <Button type="link" onClick={() => navigate('/login')}>{t('back_to_login')}</Button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default RegisterForm;
