import { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Card, Spin, Typography } from "antd";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.REACT_APP_API_URL;
const { TabPane } = Tabs;

const EarningsLineChart = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeklyRes, monthlyRes, yearlyRes] = await Promise.all([
          axios.get(`${API_URL}/api/dashboard/earnings/weekly`),
          axios.get(`${API_URL}/api/dashboard/earnings/monthly`),
          axios.get(`${API_URL}/api/dashboard/earnings/yearly`),
        ]);

        setWeeklyData(weeklyRes.data);
        setMonthlyData(monthlyRes.data);
        setYearlyData(yearlyRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching earnings data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatChartData = (data, type) => {
    let labels;
    let datasetLabel;
    if (type === "weekly") {
      labels = data.map((item) => item._id); 
      datasetLabel = t("Doanh thu tuần");
    } else if (type === "monthly") {
      labels = data.map((item) => item._id); 
      datasetLabel = t("Doanh thu tháng");
    } else if (type === "yearly") {
      labels = data.map((item) => item._id);
      datasetLabel = t("Doanh thu năm");
    }

    const earnings = data.map((item) => item.totalEarnings);

    return {
      labels,
      datasets: [
        {
          label: datasetLabel,
          data: earnings,
          fill: false,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "rgba(75,192,192,1)",
          tension: 0.1,
        },
      ],
    };
  };

  return (
    <Card className="shadow-lg mb-4">
      <Typography.Title className="text-center">Doanh thu dịch vụ</Typography.Title>
      <Tabs defaultActiveKey="weekly">
        <TabPane tab={t("Tuần")} key="weekly">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Spin size="large" />
            </div>
          ) : (
            <Line data={formatChartData(weeklyData, "weekly")} />
          )}
        </TabPane>
        <TabPane tab={t("Tháng")} key="monthly">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Spin size="large" />
            </div>
          ) : (
            <Line data={formatChartData(monthlyData, "monthly")} />
          )}
        </TabPane>
        <TabPane tab={t("Năm")} key="yearly">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Spin size="large" />
            </div>
          ) : (
            <Line data={formatChartData(yearlyData, "yearly")} />
          )}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default EarningsLineChart;
