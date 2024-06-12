import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, DatePicker, TimePicker, Button } from 'antd';

const BookingForPet = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="text-2xl py-4 px-6 bg-gray-900 text-white text-center font-bold uppercase">
        Service Booking
      </div>
      <Form
        className="py-4 px-6"
        action=""
        method="POST"
        layout="vertical"
      >
        <Form.Item
          label="Pet"
          name="pet"
          rules={[{ required: true, message: 'Please select your pet!' }]}
        >
          <Input placeholder="Choose your pet" />
        </Form.Item>
        <Form.Item
          label="Hotel Room"
          name="hotelroom"
          rules={[{ required: true, message: 'Please input your room!' }]}
        >
          <Input placeholder="Enter your your room" />
        </Form.Item>
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: 'Please select a date!' }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
        <Form.Item
          label="Time"
          name="time"
          rules={[{ required: true, message: 'Please select a time!' }]}
        >
          <TimePicker className="w-full" />
        </Form.Item>
        <div className="flex items-center justify-center mb-4">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 focus:outline-none focus:shadow-outline"
          >
            Book
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default BookingForPet;