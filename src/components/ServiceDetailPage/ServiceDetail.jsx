import React, { useState } from 'react';
import { Button, Typography, Form, Input, Select, DatePicker, TimePicker } from 'antd';
import { useNavigate } from 'react-router-dom';


const { Title, Paragraph } = Typography;
const { Option } = Select;

const ServiceDetail = ({ serviceData }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [bookingDetails, setBookingDetails] = useState({});
  const [role, setRole] = useState(localStorage.getItem('role') || 'guest');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };


  const handleBookingNow = () => {
    if (role === 'guest') {
      // Redirect to the login page
      navigate('/login');
    } else {
      // Proceed with booking logic
      console.log('Booking Now', bookingDetails);
      // Implement booking logic here
    }
  };

  const handleFormChange = (changedFields) => {
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      ...changedFields,
    }));
  };

  return (
    <div className="flex flex-col md:flex-row m-5 py-28 px-4 md:px-32">
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src={serviceData.image}
          alt={serviceData.name}
          className="max-w-full max-h-96 md:max-h-full object-contain"
        />
      </div>
      <div className="w-full md:w-1/2 p-5 md:ml-10">
        <Title level={1} className="mb-4">{serviceData.name}</Title>
        <Title level={3} className="text-green-500 mb-4">{`Price: ${serviceData.price} VND`}</Title>
        <Paragraph className="text-4xl mb-6 text-bold">{serviceData.description}</Paragraph>

        <Form
          form={form}
          layout="vertical"
          onValuesChange={(_, allValues) => handleFormChange(allValues)}
        >
          <Form.Item name="pet" label="Your Pet">
            <Select placeholder="Select your pet">
              <Option value="dog">Dog</Option>
              <Option value="cat">Cat</Option>
              <Option value="rabbit">Rabbit</Option>
              <Option value="hamster">Hamster</Option>
            </Select>
          </Form.Item>
          <Form.Item name="checkInDate" label="Check In Date">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="checkInTime" label="Check In Time">
            <TimePicker className="w-full" />
          </Form.Item>
          <Form.Item name="checkOutDate" label="Check Out Date">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleBookingNow}>Booking Now</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ServiceDetail;
