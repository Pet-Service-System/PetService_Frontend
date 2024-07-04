// Import necessary libraries and components
import { useState, useEffect } from "react";
import axios from "axios";
import { Statistic, Row, Col, Card, Typography, Spin, Image, Layout, Grid, Menu } from "antd";
import "tailwindcss/tailwind.css";
import CountUp from "react-countup";
import { setShoppingCart } from '../../redux/shoppingCart';
import {
  ShoppingCartOutlined,
  CarryOutOutlined,
  UserOutlined,
  ProductOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  LogoutOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

const API_URL = import.meta.env.REACT_APP_API_URL;

const { Title } = Typography;
const { Sider } = Layout;
const { useBreakpoint } = Grid;

// Statistic component
const Statistics = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [totalBookings, setTotalBookings] = useState(0);
  const [mostOrderedProducts, setMostOrderedProducts] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading state
  const formatter = (value) => <CountUp end={value} separator="," />;
  const dispatch = useDispatch();
  const { t } = useTranslation()
  const navigate = useNavigate();
  const screens = useBreakpoint();

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
      const response = await axios.get(`${API_URL}/api/dashboard/most-ordered-products`);
      setMostOrderedProducts(response.data);
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error('Error fetching top products:', error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  useEffect(() => {
    fetchAvailableAccounts();
    fetchCompletedOrders();
    fetchCompletedBookings();
    fetchMostOrderedProducts();
  }, []);

  const handleLogout = async () => {
    const accountID = user.id;
    const cartItems = JSON.parse(localStorage.getItem('shoppingCart')) || []; // Parse the cart items from localStorage
    console.log('User ID:', accountID);
    console.log('Cart Items:', cartItems);
  
    if (cartItems.length > 0) {
      try {
        const response = await axios.post(`${API_URL}/api/cart`, {
          AccountID: accountID, // Use accountID variable instead of undefined response.AccountID
          Items: cartItems, // Pass the parsed cartItems directly
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Cart saved successfully:', response.data);
      } catch (error) {
        console.error('Error saving cart:', error);
        // Handle specific error scenarios if needed
      }
    }
  
    localStorage.clear();
    dispatch(setShoppingCart([]));
    setRole('Guest');
    setUser(null);
    navigate('/', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '80vh' }}>
      {/* Sider */}
      {!screens.xs && (
          <Sider width={220}>
            <div className="logo" />
            <Menu theme="dark" mode="inline">
              <Menu.Item
                key="profile"
                icon={<UserOutlined />}
                onClick={() => navigate('/user-profile')}
              >
                {t('user_information')}
              </Menu.Item>
              {role === 'Customer' && (
                <>
                  <Menu.Item
                    key="pet-list"
                    icon={<UnorderedListOutlined />}
                    onClick={() => navigate('/pet-list')}
                  >
                    {t('list_of_pets')}
                  </Menu.Item>
                  <Menu.Item
                    key="order-history"
                    icon={<HistoryOutlined />}
                    onClick={() => navigate('/order-history')}
                  >
                    {t('order_history')}
                  </Menu.Item>
                  <Menu.Item key="spa-booking"
                    onClick={() => navigate('/spa-booking')}
                    icon={<HistoryOutlined />}>
                    {t('service_history')}
                  </Menu.Item>
                </>
              )}
              <Menu.Item key="statistic" icon={<LineChartOutlined />} onClick={() => navigate('/statistics')}>
                {t('statistic_title')}
              </Menu.Item>
              <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                {t('log_out')}
              </Menu.Item>
            </Menu>
          </Sider>
        )}
        <div>
          <Title level={1} className="text-center text-black mt-10">
            {t('statistic_title')}
          </Title>
          <div className="px-32">
            <Row gutter={16}>
              <Col span={12}>
                <Card className="shadow-lg mb-4"> {/* Added mb-4 for spacing */}
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
                <Card className="shadow-lg mb-4"> {/* Added mb-4 for spacing */}
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
                <Card className="shadow-lg mb-4"> {/* Added mb-4 for spacing */}
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
              <Card className="shadow-lg w-full mb-4"> {/* Added mb-4 for spacing */}
              <div className="flex flex-col items-center">
                <div className="flex flex-row mb-4 items-center">
                  <ProductOutlined className="text-7xl mr-16" />
                  <Title className="mr-8 mb-0 text-gray">
                    {t('mostPopularProduct')}
                  </Title>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <Spin size="large" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {mostOrderedProducts.length === 0 ? (
                      <div className="text-center text-gray-500">
                        {t('noDataAvailable')}
                      </div>
                    ) : (
                      mostOrderedProducts.map((product) => (
                        <Card
                          key={product._id}
                          hoverable
                          className="bg-white rounded-lg shadow-md transition-transform transform-gpu hover:scale-105 mb-4"
                        >
                          <Link to={`/product-detail/${product._id}`}>
                            <Image
                              alt={product.ProductName}
                              src={product.ImageURL}
                              preview={false}
                              className="rounded-t-lg w-full h-44 object-cover"
                              style={{ width: '100%', height: '250px' }}
                            />
                          </Link>
                          <div className="p-4">
                            <h3 className="text-2xl font-semibold">
                              {product.ProductName}
                            </h3>
                            <h2 className="text-green-600 mt-2 text-4xl">
                              {product.Price.toLocaleString('en-US')}
                            </h2>
                            <p className="text-gray-500 mt-2">{product.Description}</p>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
              </Card>
            </Row>
          </div>
        </div>
    </Layout>
  );
};

export default Statistics;
