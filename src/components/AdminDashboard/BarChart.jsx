import { Chart } from 'react-google-charts';

export default function BarChart({ data }) {
  const chartData = [
    ['Day', 'Orders', 'Bookings'],
    ...data.map(day => [day.dayOfWeek, day.Orders, day.Bookings])
  ];

  const options = {
    title: 'Orders and Bookings by Day of Week',
    chartArea: { width: '50%' },
    hAxis: {
      title: 'Day of Week',
      minValue: 1,
      maxValue: 7,
    },
    vAxis: {
      title: 'Count',
      minValue: 0,
    },
  };

  return (
    <Chart
      chartType="ColumnChart"
      width="100%"
      height="400px"
      data={chartData}
      options={options}
    />
  );
}
