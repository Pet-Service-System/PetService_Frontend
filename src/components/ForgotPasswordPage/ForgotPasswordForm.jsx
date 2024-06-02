import { Button, Form, Input, Typography, Row, Col } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  
  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      console.log('Reset password for', email);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Row justify="center" style={{ minHeight: '59vh', alignItems: 'center' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8} className='px-10'>
        <div className="p-6 md:p-12 bg-white rounded-lg shadow-md">
          <Title level={3} className="text-blue-500 text-center mb-6">Quên mật khẩu</Title>
          <Form onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Email is required' }]}
              validateStatus={errors.email && 'error'}
              help={errors.email}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">Gửi yêu cầu</Button>
            </Form.Item>
          </Form>
          <div className="text-center mt-4">
            <Button type="link" onClick={() => navigate('/login')}>Quay lại đăng nhập</Button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default ForgotPasswordForm;
