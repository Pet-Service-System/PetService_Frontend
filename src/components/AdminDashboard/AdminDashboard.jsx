import React, { useState, useEffect } from "react";
import { Layout as Menu } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { Layout, Grid as AntGrid } from "antd";
import AccordionItem from "./AccordionItem";
import BarChart from "./BarChart";
import axios from "axios";
import "./style.css";

const { Sider } = Layout;
const { useBreakpoint } = AntGrid;

export default function AdminDashboard () {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role") || "Guest");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUserData = async () => {
    setLoading(true);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
    } else {
      setUser(storedUser);
    }
    setLoading(false);
  };

  useEffect(() => {
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("account_id");
    localStorage.removeItem("fullname");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!screens.xs && (
        <Sider width={220}>
          <div className="logo" />
          <Menu theme="dark" mode="inline">
            <Menu.Item
              key="profile"
              icon={<UserOutlined />}
              onClick={() => navigate("/user-profile")}
            >
              Thông tin người dùng
            </Menu.Item>
            <Menu.Item
              key="logout"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Menu.Item>
          </Menu>
        </Sider>
      )}
      <Layout>
        <div className="bgcolor">
          <Box height={70} />
          <Box component={"main"} sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Stack spacing={2} direction={"row"}>
                  <Card
                    sx={{ minWidth: "49%", height: 150 }}
                    className="gradient"
                  >
                    <CardContent>
                      <div>
                        <CreditCardIcon
                          sx={{ fontSize: 50 }}
                          className="icon"
                        />
                      </div>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="div"
                        fontSize={25}
                        sx={{ color: "#fff" }}
                      >
                        $<CountUp delay={0.2} end={500} />
                      </Typography>
                      <Typography
                        gutterBottom
                        variant="body2"
                        component="div"
                        sx={{ color: "#ccd1d1", fontSize: 20 }}
                      >
                        Total Earnings
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card
                    sx={{ minWidth: "49%", height: 150 }}
                    className="gradientlight"
                  >
                    <CardContent>
                      <div>
                        <ShoppingBagIcon
                          sx={{ fontSize: 50 }}
                          className="icon"
                        />
                      </div>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="div"
                        fontSize={25}
                        sx={{ color: "#fff" }}
                      >
                        $<CountUp delay={0.2} end={900} />
                      </Typography>
                      <Typography
                        gutterBottom
                        variant="body2"
                        component="div"
                        sx={{ color: "#ccd1d1", fontSize: 20 }}
                      >
                        Total Orders
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack spacing={2}>
                  <Card sx={{ maxWidth: 345 }} className="gradientlight">
                    <Stack spacing={2} direction={"row"}>
                      <div className="icon">
                        <StorefrontIcon sx={{ fontSize: 55 }} />
                      </div>
                      <div className="paddingall">
                        <span className="pricetitle">Total Bookings</span>
                        <br />
                        <span>
                          <CountUp delay={0.2} end={10} />
                        </span>
                      </div>
                    </Stack>
                  </Card>
                  <Card sx={{ maxWidth: 345 }}>
                    <Stack spacing={2} direction={"row"}>
                      <div className="iconstyle">
                        <StorefrontIcon sx={{ fontSize: 55 }} />
                      </div>
                      <div className="paddingall">
                        <span className="pricetitle">Total Users</span>
                        <br />
                        <span>
                          {/* <CountUp delay={0.2} end={totalUsers} /> */}
                          <CountUp delay={0.2} end={10} />
                        </span>
                      </div>
                    </Stack>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
            <Box height={20} />
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Card sx={{ height: "60vh" }}>
                  <CardContent>
                    <BarChart />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ height: "60vh" }}>
                  <CardContent>
                    <div className="paddingall">
                      <span className="pricetitle">Popular Products</span>
                    </div>
                    <AccordionItem />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </div>
      </Layout>
    </Layout>
  );
};
