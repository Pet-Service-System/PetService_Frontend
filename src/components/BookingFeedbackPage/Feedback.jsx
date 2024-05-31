import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div className="flex justify-center items-center p-20 bg-gray-100">
            <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-3xl font-semibold mb-4 text-center">Phản Hồi Khách Hàng</h2>
                <div className="mb-4">
                    <strong>Tên Khách Hàng:</strong> {feedbackData.customerName}
                </div>
                <div className="mb-4">
                    <strong>Email:</strong> {feedbackData.email}
                </div>
                <div className="mb-4">
                    <strong>Nội Dung Phản Hồi:</strong>
                    <p className='text-green-600'>{feedbackData.content}</p>
                </div>
                <div className="mb-4">
                    <strong>Ngày Phản Hồi:</strong> {feedbackData.date}
                </div>
                {showFeedbackForm ? (
                    <div className="mb-4">
                        <textarea className="p-2 rounded-md w-full" placeholder="Nhập phản hồi của bạn"></textarea>
                        <div className="mt-2 flex justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                                onClick={handleSendFeedback}
                            >
                                Gửi
                            </button>
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleCancelFeedback}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
                        onClick={handleFeedback}
                    >
                        Phản Hồi
                    </button>
                )}
                <button
                    className="bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded w-full mb-4"
                    onClick={() => navigate('/booking-list')}
                >
                    Trở Về
                </button>
                {showSuccessMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Gửi phản hồi thành công!</strong>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Feedback;
