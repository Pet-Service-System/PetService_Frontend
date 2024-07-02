// Import necessary libraries and components
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Statistic, Row, Col, Card, Typography } from 'antd';
import 'tailwindcss/tailwind.css';
import CountUp from 'react-countup';
import { ShoppingCartOutlined, CarryOutOutlined } from '@ant-design/icons';
const API_URL = import.meta.env.REACT_APP_API_URL;

const { Title } = Typography

// getOrderHistory function
const getOrderHistory = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/api/orders/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
};

// getSpaBookings function
const getSpaBookings = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/api/Spa-bookings/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching spa bookings:', error);
    throw error;
  }
};

// Statistic component
const Statistics = () => {
  const [orderCount, setOrderCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const formatter = (value) => <CountUp end={value} separator="," />;

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const orders = await getOrderHistory();
        const bookings = await getSpaBookings();

        const shippedOrders = orders.filter(order => order.Status === 'Shipped').length;
        const completedBookings = bookings.filter(booking => booking.Status === 'Completed').length;

        setOrderCount(shippedOrders);
        setBookingCount(completedBookings);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="p-8">
      <Title level={1} className='text-center'>Hello</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Card className="shadow-lg">
            <div className='flex flex-row'>
              <ShoppingCartOutlined className="text-7xl mr-16"/>
              <Statistic title="Shipped Orders" value={orderCount} formatter={formatter} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="shadow-lg">
            <div className='flex flex-row'>
              <CarryOutOutlined className="text-7xl mr-16"/>
              <Statistic title="Completed Spa Bookings" value={bookingCount} formatter={formatter} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
