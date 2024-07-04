import React from "react";
import { Chart } from "react-google-charts";

export const data = [
  ["Day of week", "Total Services Booked", "Total Ordered"],
  ["Mon", 1030, 540],
  ["Tue", 1030, 540],
  ["Wed", 1030, 540],
  ["Thu", 1030, 540],
  ["Fri", 1030, 540],
  ["Sat", 1030, 540],
  ["Sun", 1030, 540],
];

export const options = {
  chart: {
    title: "Company Performance",
    subtitle: "Total Services Booked, Total Ordered",
  },
  colors: ["rgb(53, 138, 148)", "rgb(37, 11, 165)", "#188310"],
};

export default function BarChart() {
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
