import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Typography, Alert } from 'antd';

const { TextArea } = Input;
const { Title, Text } = Typography;

const Feedback = () => {
    const navigate = useNavigate();
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const feedbackData = {
        customerName: 'John Doe',
        email: 'john.doe@example.com',
        content: 'Dịch vụ tuyệt vời! Tôi rất hài lòng với trải nghiệm của mình.',
        date: '2024-05-25'
    };

    const handleFeedback = () => {
        setShowFeedbackForm(true);
    };

    const handleCancelFeedback = () => {
        setShowFeedbackForm(false);
    };

    const handleSendFeedback = () => {
        setShowFeedbackForm(false);
        setShowSuccessMessage(true);
        setTimeout(() => {
            setShowSuccessMessage(false);
            navigate('/booking-list');
        }, 2000);
    };

    return (
        <div className="flex justify-center items-center p-20 bg-gray-100 min-h-screen">
            <Card className="w-full max-w-lg shadow-lg">
                <Title level={2} className="text-center mb-4">Phản Hồi Khách Hàng</Title>
                <div className="mb-4">
                    <Text strong>Tên Khách Hàng:</Text> {feedbackData.customerName}
                </div>
                <div className="mb-4">
                    <Text strong>Email:</Text> {feedbackData.email}
                </div>
                <div className="mb-4">
                    <Text strong>Nội Dung Phản Hồi:</Text>
                    <p className='text-green-600'>{feedbackData.content}</p>
                </div>
                <div className="mb-4">
                    <Text strong>Ngày Phản Hồi:</Text> {feedbackData.date}
                </div>
                {showFeedbackForm ? (
                    <div className="mb-4">
                        <TextArea className="p-2 rounded-md w-full" placeholder="Nhập phản hồi của bạn" rows={4} />
                        <div className="mt-2 flex justify-between">
                            <Button
                                type="primary"
                                className="mr-2"
                                onClick={handleSendFeedback}
                            >
                                Gửi
                            </Button>
                            <Button
                                type="default"
                                onClick={handleCancelFeedback}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        type="primary"
                        className="w-full mb-4"
                        onClick={handleFeedback}
                    >
                        Phản Hồi
                    </Button>
                )}
                <Button
                    type="default"
                    className="w-full mb-4"
                    onClick={() => navigate('/booking-list')}
                >
                    Trở Về
                </Button>
                {showSuccessMessage && (
                    <Alert
                        message="Gửi phản hồi thành công!"
                        type="success"
                        showIcon
                        className="mt-4"
                    />
                )}
            </Card>
        </div>
    );
}

export default Feedback;
