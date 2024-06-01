import React from 'react';
import { FaHouseChimney } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { FaPhoneAlt } from "react-icons/fa";
import { Form, Input, Button, Row, Col, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Contact = () => {
  return (
    <div className="bg-gray-100 px-4 md:px-20 lg:px-40">
      <div className="container mx-auto">
        <Title level={2} className="text-red-500 text-center font-semibold mb-8 mt-10">Liên hệ</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="address-row flex items-center">
              <FaHouseChimney className='icon w-12 h-12 md:w-20 md:h-20' />
              <div className="address-right ml-4">
                <Title level={5} className="font-semibold">Visit Us</Title>
                <Paragraph>Pet Service Quận 7</Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="address-row flex items-center">
              <IoMdMail className='icon w-12 h-12 md:w-20 md:h-20' />
              <div className="address-right ml-4">
                <Title level={5} className="font-semibold">Mail Us</Title>
                <Paragraph>
                  <a href="mailto:petservicemanagement@gmail.com">petservicemanagement@gmail.com</a>
                </Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="address-row flex items-center">
              <FaPhoneAlt className='icon w-12 h-12 md:w-20 md:h-20' />
              <div className="address-right ml-4">
                <Title level={5} className="font-semibold">Call Us</Title>
                <Paragraph>(+00) 123 234</Paragraph>
              </div>
            </div>
          </Col>
        </Row>
        <Form className="mt-8" layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input placeholder="Your Name" />
              </Form.Item>
              <Form.Item
                name="Email"
                rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item
                name="Mobile Number"
                rules={[{ required: true, message: 'Please enter your mobile number' }]}
              >
                <Input placeholder="Mobile Number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="Message"
                rules={[{ required: true, message: 'Please enter your message' }]}
              >
                <Input.TextArea placeholder="Message" rows={4} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">
                  Submit
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default Contact;
