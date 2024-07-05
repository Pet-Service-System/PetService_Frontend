import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import axios from "axios";

const API_URL = import.meta.env.REACT_APP_API_URL;

export const options = {
  chart: {
    title: "Company Performance",
    subtitle: "Total Services Booked, Total Ordered",
  },
  colors: ["rgb(53, 138, 148)", "rgb(37, 11, 165)", "#188310"],
};

export default function BarChart() {
  const [data, setData] = useState([
    ["Day of week", "Total Services Booked", "Total Ordered"],
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/dashboard/count-orders-bookings-by-day`);
        const apiData = response.data;

        // Directly use the API data
        setData(apiData);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Chart
      chartType="Bar"
      width="100%"
      height="350px"
      data={data}
      options={options}
    />
  );
}