import { useState} from 'react';
import { Button, Form, Input, Typography, Row, Col, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // State để điều khiển trạng thái của nút Gửi yêu cầu
  const navigate = useNavigate();
  
  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email là bắt buộc';
    return newErrors;
  };
  const validationErrors = validate();
  
  const handleSubmit = async () => {
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true); // Vô hiệu hóa nút Gửi yêu cầu
        const response = await axios.post('http://localhost:3001/forgot-password', {
            email: email,
        });
        console.log('Data from server:', response.data);
        message.success('Yêu cầu đặt lại mật khẩu thành công. Vui lòng kiểm tra mail của bạn.', 2.5).then(()=>{
          message.info('Bạn sẽ được chuyển hướng đến trang đăng nhập.', 1.5).then(() => {
            navigate('/login');
          });
        })
      } catch (error) {
        console.error('Error during password reset:', error);
        message.error(error.response.data.message);
      } finally {
        setIsLoading(false); // Enable lại nút Gửi yêu cầu
      }
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
              rules={[{ required: true, message: 'Email là bắt buộc' }]}
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
              <Button type="primary" htmlType="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
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
