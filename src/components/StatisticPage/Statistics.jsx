// Import necessary libraries and components
import { useState, useEffect } from "react";
import axios from "axios";
import { Statistic, Row, Col, Card, Typography } from "antd";
import "tailwindcss/tailwind.css";
import CountUp from "react-countup";
import {
  ShoppingCartOutlined,
  CarryOutOutlined,
  UserOutlined,
  ProductOutlined,
} from "@ant-design/icons";
const API_URL = import.meta.env.REACT_APP_API_URL;

const { Title } = Typography;

// getOrderHistory function
const getOrderHistory = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/api/orders/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
};

// getSpaBookings function
const getSpaBookings = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/api/Spa-bookings/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching spa bookings:", error);
    throw error;
  }
};

// Statistic component
const Statistics = () => {
  // const [orderCount, setOrderCount] = useState(0);
  // const [bookingCount, setBookingCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [mostOrderedProducts, setMostOrderedProducts] = useState([]);
  const formatter = (value) => <CountUp end={value} separator="," />;

  const fetchUserData = async () => {
    setLoading(true);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
    } else {
      setUser(storedUser);
      setFormData({ ...storedUser });
    }
    setLoading(false);
  };

  const fetchAvailableAccounts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/dashboard/count-available-accounts`
      );
      setTotalUsers(response.data.count);
    } catch (error) {
      console.error("Error fetching available accounts:", error);
    }
  };

  // Fetch the count of completed orders
  const fetchCompletedOrders = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/dashboard/count-completed-orders`
      );
      setTotalOrders(response.data.count);
    } catch (error) {
      console.error("Error fetching completed orders:", error);
    }
  };

  const fetchCompletedBookings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/dashboard/count-completed-bookings`
      );
      setTotalBookings(response.data.count);
    } catch (error) {
      console.error("Error fetching completed bookings:", error);
    }
  };

  const fetchMostOrderedProducts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/dashboard/most-ordered-products`
      );
      setMostOrderedProducts(response.data);
    } catch (error) {
      console.error("Error fetching top products:", error);
    }
  };

  // const fetchStatistics = async () => {
  //   try {
  //     const orders = await getOrderHistory();
  //     const bookings = await getSpaBookings();

  //     const shippedOrders = orders.filter(
  //       (order) => order.Status === "Shipped"
  //     ).length;
  //     const completedBookings = bookings.filter(
  //       (booking) => booking.Status === "Completed"
  //     ).length;

  //     setOrderCount(shippedOrders);
  //     setBookingCount(completedBookings);
  //   } catch (error) {
  //     console.error("Error fetching statistics:", error);
  //   }
  // };

  useEffect(() => {
    fetchUserData();
    fetchAvailableAccounts();
    fetchCompletedOrders();
    fetchCompletedBookings();
    fetchMostOrderedProducts();
    //fetchStatistics();
  }, []);

  return (
    <div className="p-8">
      <Title level={1} className="text-center text-black">
        Dashboard
      </Title>
      <Row gutter={16}>
        <Col span={12}>
          <Card className="shadow-lg">
            <div className="flex flex-row">
              <ShoppingCartOutlined className="text-7xl mr-16" />
              <Statistic
                title="Shipped Orders"
                value={totalOrders}
                formatter={formatter}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="shadow-lg">
            <div className="flex flex-row">
              <CarryOutOutlined className="text-7xl mr-16" />
              <Statistic
                title="Completed Spa Bookings"
                value={totalBookings}
                formatter={formatter}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="shadow-lg">
            <div className="flex flex-row">
              <UserOutlined className="text-7xl mr-16" />
              <Statistic
                title="Total Active Users"
                value={totalUsers}
                formatter={formatter}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="shadow-lg">
            <div className="flex flex-row">
              <ProductOutlined className="text-7xl mr-16" />
              <div className="flex flex-row items-center">
                <p level={5} className="mr-8 mb-0 text-gray">
                  Most popular product
                </p>
                <ul className="flex flex-wrap">
                  {mostOrderedProducts.map((product) => (
                    <li
                      key={product._id}
                      className="flex items-center mb-4 mr-4"
                    >
                      <img
                        src={product.ImageURL}
                        alt={product.ProductName}
                        width={50}
                        height={10}
                        className="mr-4"
                      />
                      <div>
                        <Title level={5} className="mb-0 text-black">
                          {product.ProductName}
                        </Title>
                        <p className="text-gray-600 mb-0">
                          Price: ${product.Price}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
