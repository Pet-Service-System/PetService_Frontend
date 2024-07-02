import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // State để điều khiển trạng thái của nút Đổi mật khẩu
  const [disableChangePassword, setDisableChangePassword] = useState(false); // State để điều khiển việc vô hiệu hóa nút Đổi mật khẩu
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    let timer;
    if (disableChangePassword) {
      timer = setTimeout(() => {
        setDisableChangePassword(false);
      }, 1000); // Vô hiệu hóa trong 1 giây
    }

    return () => clearTimeout(timer);
  }, [disableChangePassword]);

  const validate = () => {
    const newErrors = {};
    if (!currentPassword.trim()) newErrors.currentPassword = t('current_password_is_required');
    if (!newPassword.trim()) newErrors.newPassword = t('new_password_is_required');
    if (!confirmPassword.trim()) newErrors.confirmPassword = t('confirm_password_is_required');
    if (newPassword === currentPassword) newErrors.newPassword = t('new_password_must_be_different');
    if (newPassword !== confirmPassword) newErrors.confirmPassword = t('passwords_do_not_match');
    return newErrors;
  };

  const handleSubmit = async () => {
    if (disableChangePassword) return; // Nếu đang trong quá trình vô hiệu hóa, không thực hiện gì
    const token = localStorage.getItem('token'); // Get token from localStorage
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true); // Vô hiệu hóa nút Đổi mật khẩu
        // Gửi request để đổi mật khẩu
        const response = await axios.post('http://localhost:3001/api/auth/change-password', {
          currentPassword: currentPassword,
          newPassword: newPassword,
        }, {
          headers: {
            Authorization: `Bearer ${token}` // Pass token in Authorization header
          }
        });
        console.log('Password changed successfully', response.data);
        // Hiển thị thông báo thành công và mở modal
        message.success(t('password_changed_successfully'), 1).then(() => {
          navigate('/user-profile');
        });
        setDisableChangePassword(true); // Bắt đầu quá trình vô hiệu hóa nút Đổi mật khẩu
      } catch (error) {
        // Xử lý lỗi khi gặp lỗi trong quá trình đổi mật khẩu
        if (error.response) {
          message.error(error.response.data.message);
        } else {
          message.error(t('an_error_occurred'));
        }
        setDisableChangePassword(true); // Bắt đầu quá trình vô hiệu hóa nút Đổi mật khẩu
      } finally {
        setIsLoading(false); // Enable lại nút Đổi mật khẩu
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleCancel = () => {
    // Xử lý hành động khi bấm nút "Cancel" ở đây
    // Ví dụ: chuyển hướng về trang trước đó
    navigate(-1);
  };

  return (
    <div className="max-w-3xl mx-auto p-12 bg-white rounded-lg py-20">
      <div className="max-w-4xl p-8 bg-white rounded-lg shadow-md">
        <Title level={2} className="text-center mb-6">
          {t('change_password')}
        </Title>
        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label={t('current_password')}
            validateStatus={errors.currentPassword ? 'error' : ''}
            help={errors.currentPassword}
            rules={[{ required: true, message: t('current_password_is_required') }]}
          >
            <Input.Password
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label={t('new_password')}
            validateStatus={errors.newPassword ? 'error' : ''}
            help={errors.newPassword}
            rules={[{ required: true, message: t('new_password_is_required') }]}
          >
            <Input.Password
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label={t('confirm_new_password')}
            validateStatus={errors.confirmPassword ? 'error' : ''}
            help={errors.confirmPassword}
            rules={[{ required: true, message: t('confirm_password_is_required') }]}
          >
            <Input.Password
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>
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
