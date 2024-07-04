import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Row,
  Col,
  Grid as AntGrid,
  Statistic,
} from "antd";
import {
  UserOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BarChart from "./BarChart";
import "./style.css";

const { Content } = Layout;
const { useBreakpoint } = AntGrid;
const { Title, Text } = Typography;
const API_URL = import.meta.env.REACT_APP_API_URL;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role") || "Guest");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [mostOrderedProducts, setMostOrderedProducts] = useState([]);
  const [isCountUpComplete, setIsCountUpComplete] = useState(false);

  useEffect(() => {
    // Fetch the count of available accounts
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

    fetchAvailableAccounts();
    fetchCompletedOrders();
    fetchCompletedBookings();
    fetchMostOrderedProducts();
    setLoading(false);
    setIsCountUpComplete(true);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ padding: "24px" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CreditCardOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                  <Statistic
                    title="Total Earnings"
                    value={500}
                    precision={2}
                    prefix="$"
                    valueStyle={{ color: "#3f8600" }}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <ShoppingOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                  <Statistic
                    title="Total Orders"
                    value={totalOrders}
                    valueStyle={{ color: "#cf1322" }}
                    suffix={isCountUpComplete && <CountUp end={totalOrders} />}
                  />
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
            <Col xs={24} md={12}>
              <Card>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <ShopOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                  <Statistic
                    title="Total Bookings"
                    value={totalBookings}
                    valueStyle={{ color: "#3f8600" }}
                    suffix={isCountUpComplete && <CountUp end={totalBookings} />}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <UserOutlined
                    style={{ fontSize: "24px", marginRight: "8px" }}
                  />
                  <Statistic
                    title="Total Users"
                    value={totalUsers}
                    valueStyle={{ color: "#cf1322" }}
                    suffix={isCountUpComplete && <CountUp end={totalUsers} />}
                  />
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
            <Col xs={24} md={16}>
              <Card>
                <BarChart />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Popular Products">
                <ul>
                  {mostOrderedProducts.map((product) => (
                    <li key={product._id}>
                      <img
                        src={product.ImageURL}
                        alt={product.ProductName}
                        width={50}
                        height={50}
                      />
                      <div>
                        <Title level={5}>{product.ProductName}</Title>
                        <Text>
                          Quantity:{" "}
                          {isCountUpComplete && (
                            <CountUp end={product.totalQuantity} />
                          )}
                        </Text>
                        <br />
                        <Text>Price: ${product.Price}</Text>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}
