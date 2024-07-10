import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LockOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const API_URL = import.meta.env.REACT_APP_API_URL;

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [disableChangePassword, setDisableChangePassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Disable button when proccessing
  useEffect(() => {
    let timer;
    if (disableChangePassword) {
      timer = setTimeout(() => {
        setDisableChangePassword(false);
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [disableChangePassword]);

  const validate = () => {
    const newErrors = {};
    if (!currentPassword.trim()) newErrors.currentPassword = t('current_password_is_required');
    if (!newPassword.trim()) newErrors.newPassword = t('new_password_is_required');
    if (newPassword.length < 8) newErrors.newPassword = t('password_min_length');
    if (!confirmPassword.trim()) newErrors.confirmPassword = t('confirm_password_is_required');
    if (newPassword === currentPassword) newErrors.newPassword = t('new_password_must_be_different');
    if (newPassword !== confirmPassword) newErrors.confirmPassword = t('passwords_do_not_match');
    setErrors(newErrors); // Cập nhật state errors để hiển thị lỗi ngay khi validation fails
    return newErrors;
  };


  const handleSubmit = async () => {
    // check if button is disabled
    if (disableChangePassword) return;
    const token = localStorage.getItem('token');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true);
        const response = await axios.post(`${API_URL}/api/auth/change-password`, {
          currentPassword: currentPassword,
          newPassword: newPassword,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Password changed successfully', response.data);
        message.success(t('password_changed_successfully'), 1).then(() => {
          navigate('/user-profile');
        });
        setDisableChangePassword(true);
      } catch (error) {
        if (error.response) {
          message.error(error.response.data.message);
        } else {
          message.error(t('an_error_occurred'));
        }
        setDisableChangePassword(true);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // go back previous page
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-3xl mx-auto p-12 bg-white rounded-lg py-20">
      <div className="max-w-4xl p-8 bg-white rounded-lg shadow-md">
        <Title level={2} className="text-center mb-6">
          {t('change_password')}
        </Title>
        <Form onFinish={handleSubmit} layout="vertical">
        {/* Current pwd */}
        <Form.Item
          label={t('current_password')}
          validateStatus={errors.currentPassword ? 'error' : ''}
          help={errors.currentPassword}
          hasFeedback
          validateTrigger="onChange"
          rules={[
            { required: true, message: t('password_is_required') },
            { min: 8, message: t('password_min_length') } 
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('current_password')}
          />
        </Form.Item>
        {/* New pwd */}
        <Form.Item
          label={t('new_password')}
          validateStatus={errors.newPassword ? 'error' : ''}
          help={errors.newPassword}
          hasFeedback
          validateTrigger="onChange"
          rules={[
            { required: true, message: t('new_password_is_required') },
            { min: 8, message: t('password_min_length') }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('new_password')}
          />
        </Form.Item>
        {/* Confirm new pwd */}
        <Form.Item
          label={t('confirm_new_password')}
          validateStatus={errors.confirmPassword ? 'error' : ''}
          help={errors.confirmPassword}
          hasFeedback
          validateTrigger="onChange"
          rules={[
            { required: true, message: t('confirm_password_is_required') },
            { min: 8, message: t('password_min_length') }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('confirm_new_password')}
          />
        </Form.Item>
        {/* Button */}
        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" htmlType="submit" className="mr-2" disabled={isLoading || disableChangePassword}>
              {disableChangePassword ? t('changing_password') : t('change_password')}
            </Button>
            <Button onClick={handleCancel}>
              {t('cancel')}
            </Button>
          </div>
        </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
