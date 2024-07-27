import { Button, Form, Input, Typography, Row, Col, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';


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

  const validate = async () => {
    const newErrors = {};

    if (!fullname) {
      newErrors.fullname = t('fullname_required');
    } else if (fullname.length < 2 || fullname.length > 50) {
      newErrors.fullname = t('fullname_length');
    }

    if (!email) {
      newErrors.email = t('email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('email_invalid');
    } else {
      const emailExists = await checkEmailExists(email);
      console.log(emailExists);
      if (emailExists) {
        newErrors.email = t('email_already_used');
      }
    }
    if (!password) {
      newErrors.password = t('password_required');
    } else if (password.length < 8 || !/[a-zA-Z]/.test(password)) {
      newErrors.password = t('password_must_have_8_characters_and_word');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('passwords_do_not_match');
    }

    if (!phoneNumber) {
      newErrors.phoneNumber = t('phone_number_required');
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = t('phone_must_have_10_numbers');
    }

    if (!address) {
      newErrors.address = t('address_required');
    } else if (address.length < 2 || address.length > 100) {
      newErrors.address = t('address_length');
    }

    return newErrors;
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/check-email`, { email });
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
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

    const validationErrors = await validate();
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
          membershipType: 'Basic',
          totalSpent: 0,
          startDate: '',
          endDate: '',
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
      <Col xs={24} sm={20} md={16} lg={12} xl={9} className="px-10 py-10">
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
                prefix={<UserOutlined />}
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                name="fullname"
                placeholder={t('fullname')}
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
                prefix={<MailOutlined />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email')}
              />
            </Form.Item>
            {/* Password */}
            <Form.Item
              label={t('password')}
              name="password"
              validateStatus={errors.password && 'error'}
              help={errors.password}
              rules={[{ required: true, message: t('plz_enter_password') }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                placeholder={t('password')}
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
                prefix={<LockOutlined />}
                onChange={(e) => setConfirmPassword(e.target.value)}
                name="confirmPassword"
                placeholder={t('confirm_password')}
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
                prefix={<PhoneOutlined />}
                onChange={(e) => setPhoneNumber(e.target.value)}
                name="phoneNumber"
                placeholder={t('phone_number')}
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
                prefix={<HomeOutlined />}
                onChange={(e) => setAddress(e.target.value)}
                name="address"
                placeholder={t('address')}
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
