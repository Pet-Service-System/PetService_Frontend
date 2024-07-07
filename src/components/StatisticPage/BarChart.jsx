import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.REACT_APP_API_URL;

export default function BarChart() {
  const { t } = useTranslation();
  const [data, setData] = useState([
    [t("day_of_week"), t("total_services_booked"), t("total_ordered")],
  ]);

  const options = {
    chart: {
      title: t("company_performance"),
      subtitle: t("services_booked_ordered"),
    },
    colors: ["rgb(53, 138, 148)", "rgb(37, 11, 165)", "#188310"],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/dashboard/count-orders-bookings-by-day`);
        const apiData = response.data;
        // Directly use the API data
        const translatedData = [
          [t("day_of_week"), t("total_services_booked"), t("total_ordered")],
          ...apiData.slice(1),
        ];
        setData(translatedData);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [t]); // Re-fetch data when the translation changes

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
