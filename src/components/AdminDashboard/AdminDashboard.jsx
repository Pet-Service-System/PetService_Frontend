import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Menu,
  Row,
  Image,
  Col,
  Grid as AntGrid,
  Statistic,
} from "antd";
import {
  UserOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  LineChartOutlined,
  LogoutOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import BarChart from "./BarChart";
import "./style.css";

const { Content, Sider } = Layout;
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
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [mostOrderedProducts, setMostOrderedProducts] = useState([]);
  const [isCountUpComplete, setIsCountUpComplete] = useState(false);
  const { t } = useTranslation();
  const formatter = (value) => <CountUp end={value} separator="," />;

  if(role === 'Customer' || role === 'Guest'){
    navigate('/')
  }

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

    const fetchTotalEarnings = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/dashboard/calculate-earnings`
        );
        console.log(response.data)
        setTotalEarnings(response.data.totalEarnings);
      } catch (error) {
        console.error("Error fetching earnings:", error);
      }
    };

    fetchAvailableAccounts();
    fetchCompletedOrders();
    fetchCompletedBookings();
    fetchMostOrderedProducts();
    fetchTotalEarnings();
    setLoading(false);
    setIsCountUpComplete(true);
  }, []);

  const handleLogout = async () => {
    const accountID = user.id;
    const cartItems = JSON.parse(localStorage.getItem("shoppingCart")) || [];

    if (cartItems.length > 0) {
      try {
        const response = await axios.post(
          `${API_URL}/api/cart`,
          {
            AccountID: accountID,
            Items: cartItems,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Cart saved successfully:", response.data);
      } catch (error) {
        console.error("Error saving cart:", error);
      }
    }

    localStorage.clear();
    dispatch(setShoppingCart([]));
    setRole("Guest");
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <Layout style={{ minHeight: "80vh" }}>
      {!screens.xs && (
        <Sider width={220}>
          <div className="logo" />
          <Menu theme="dark" mode="inline">
            <Menu.Item
              key="profile"
              icon={<UserOutlined />}
              onClick={() => navigate("/user-profile")}
            >
              {t("user_information")}
            </Menu.Item>

            {role === "Customer" && (
              <>
                <Menu.Item
                  key="pet-list"
                  icon={<UnorderedListOutlined />}
                  onClick={() => navigate("/pet-list")}
                >
                  {t("list_of_pets")}
                </Menu.Item>
                <Menu.Item
                  key="order-history"
                  icon={<HistoryOutlined />}
                  onClick={() => navigate("/order-history")}
                >
                  {t("order_history")}
                </Menu.Item>
                <Menu.Item
                  key="spa-booking"
                  icon={<HistoryOutlined />}
                  onClick={() => navigate("/spa-booking")}
                >
                  {t("service_history")}
                </Menu.Item>
              </>
            )}
            <Menu.Item
              key="statistic"
              icon={<LineChartOutlined />}
              onClick={() => navigate("/statistics")}
            >
              {t("statistic_title")}
            </Menu.Item>
            <Menu.Item
              key="logout"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              {t("log_out")}
            </Menu.Item>
          </Menu>
        </Sider>
      )}
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
                    title={t('totalEarnings')}
                    value={totalEarnings}
                    precision={2}
                    prefix="$"
                    valueStyle={{ color: "#3f8600" }}
                    formatter={formatter}
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
                    title={t('shippedOrders')}
                    valueStyle={{ color: "#cf1322" }}
                    value={totalOrders}
                    formatter={formatter}
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
                    title={t('completedSpaBookings')}
                    value={totalBookings}
                    valueStyle={{ color: "#3f8600" }}
                    formatter={formatter}
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
                    title={t('totalActiveUsers')}
                    value={totalUsers}
                    valueStyle={{ color: "#cf1322" }}
                    formatter={formatter}
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
              <Card title={t('mostPopularProduct')}>
                <ul>
                  {mostOrderedProducts.map((product) => (
                    <li key={product._id}>
                      <Link to={`/product-detail/${product._id}`}>
                        <Image
                          src={product.ImageURL}
                          alt={product.ProductName}
                          preview={false}
                          width={50}
                          height={50}
                        />
                      </Link>
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
