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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
const API_URL = import.meta.env.REACT_APP_API_URL;

const { Title } = Typography;

// getOrderHistory function
// const getOrderHistory = async () => {
//   const token = localStorage.getItem("token");
//   try {
//     const response = await axios.get(`${API_URL}/api/orders/`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching order history:", error);
//     throw error;
//   }
// };

// getSpaBookings function
// const getSpaBookings = async () => {
//   const token = localStorage.getItem("token");
//   try {
//     const response = await axios.get(`${API_URL}/api/Spa-bookings/`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching spa bookings:", error);
//     throw error;
//   }
// };

// Statistic component
const Statistics = () => {
  // const [orderCount, setOrderCount] = useState(0);
  // const [bookingCount, setBookingCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [mostOrderedProducts, setMostOrderedProducts] = useState([]);
  const formatter = (value) => <CountUp end={value} separator="," />;
  const { t } = useTranslation()

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
      console.log(mostOrderedProducts)
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
        {t('statistic_title')}
      </Title>
      <Row gutter={16}>
        <Col span={12}>
          <Card className="shadow-lg">
            <div className="flex flex-row">
              <ShoppingCartOutlined className="text-7xl mr-16" />
              <Statistic
                title={t('shippedOrders')}
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
                title={t('completedSpaBookings')}
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
                title={t('totalActiveUsers')}
                value={totalUsers}
                formatter={formatter}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="shadow-lg">
            <div className="flex flex-col">
              <div className="flex flex-row mb-4 items-center">
                <ProductOutlined className="text-7xl mr-16" />
                <p className="mr-8 mb-0 text-gray">
                  {t('mostPopularProduct')}
                </p>
              </div>
              <ul className="flex flex-col">
                {mostOrderedProducts.map((product) => (
                  <li key={product._id} className="flex mb-4 items-start">
                    <img
                      src={product.ImageURL}
                      alt={product.ProductName}
                      width={50}
                      height={50}
                      className="mr-4"
                    />
                    <div>
                      <Title level={5} className="mb-1 text-black">
                        <Link className="text-blue-500 hover:text-blue-800" to={`/product-detail/${product._id}`}>
                          {product.ProductName}
                        </Link>
                      </Title>
                      <p className="text-gray-600 mb-0">
                        {t('price')}: {product.Price.toLocaleString('en-US')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
