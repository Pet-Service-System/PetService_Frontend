import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const ResetPasswordForm = () => {
  const handleSubmit = (values) => {
    console.log('Nhận giá trị:', values);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-lg w-full p-8 border rounded-lg shadow-md">
        <Title level={3} className="text-center mb-6">Đặt lại Mật khẩu</Title>
        <Form
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Xác nhận Mật khẩu mới"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Hai mật khẩu bạn đã nhập không khớp'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đặt lại Mật khẩu
            </Button>
            <Link to="/login">
              <Button type="default" htmlType="button" block style={{ marginTop: '10px' }}>
                Hủy
              </Button>
            </Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
