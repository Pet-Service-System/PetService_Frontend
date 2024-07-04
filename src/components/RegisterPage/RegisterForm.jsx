import { Button, Form, Input, Typography, Row, Col, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


const { Title } = Typography;
const API_URL = import.meta.env.REACT_APP_API_URL;

const RegisterForm = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [disableRegister, setDisableRegister] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validate = () => {
    const newErrors = {};
    if (!fullname) newErrors.fullname = t('fullname_required');
    if (!email) newErrors.email = t('email_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('email_invalid');
    }
    if (!password) {
      newErrors.password = t('password_required');
    } else if (password.length < 8) {
      newErrors.password = t('password_must_have_8_characters');
    }
    if (password !== confirmPassword) newErrors.confirmPassword = t('passwords_do_not_match');
    if (!phoneNumber) newErrors.phoneNumber = t('phone_number_required');
    else if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = t('phone_must_have_10_numbers');
    }
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
        const response = await axios.post(`${API_URL}/api/auth/register`, {
          fullname,
          password,
          email,
          phone: phoneNumber,
          address,
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
            {/* Fullname */}
            <Form.Item
              label={t('fullname')}
              name="fullname"
              validateStatus={errors.fullname && 'error'}
              help={errors.fullname}
              rules={[{ required: true, message: t('plz_enter_fullname') }]}
            >
              <Input
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                name="fullname"
              />
            </Form.Item>
            {/* Email */}
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: t('email_required') }]}
              validateStatus={errors.email && 'error'}
              help={errors.email}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>
            {/* Password */}
            <Form.Item
              label={t('password')}
              name="password"
              validateStatus={errors.password && 'error'}
              help={errors.password}
              rules={[{ required: true, message: t('plz_enter_password')}]}
            >
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
              />
            </Form.Item>
            {/* Confirm password */}
            <Form.Item
              label={t('confirm_password')}
              name="confirmPassword"
              validateStatus={errors.confirmPassword && 'error'}
              help={errors.confirmPassword}
              rules={[{ required: true, message: t('plz_confirm_password') }]}
            >
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                name="confirmPassword"
              />
            </Form.Item>
            {/* Phone number */}
            <Form.Item
              label={t('phone_number')}
              name="phoneNumber"
              validateStatus={errors.phoneNumber && 'error'}
              help={errors.phoneNumber}
              rules={[{ required: true, message: t('plz_enter_phone') }]}
            >
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                name="phoneNumber"
              />
            </Form.Item>
            {/* Address */}
            <Form.Item
              label={t('address')}
              name="address"
              validateStatus={errors.address && 'error'}
              help={errors.address}
              rules={[{ required: true, message: t('plz_enter_address') }]}
            >
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                name="address"
              />
            </Form.Item>
            {/* Buttons */}
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full" disabled={isLoading || disableRegister}>
                {disableRegister ? t('registering') : t('register')}
              </Button>
            </Form.Item>
          </Form>
          {/* Go back to login link */}
          <div className="text-center mt-4">
            <Button type="link" onClick={() => navigate('/login')}>{t('back_to_login')}</Button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default RegisterForm;
