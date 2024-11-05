import React from 'react';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement,  LineElement, PointElement, Title, Tooltip, Legend, ChartData } from 'chart.js';

//Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

type CarbonEmissionChartProps = {
  monthlyEmissions: number[];
  averageAbsorbed: number | null;
};

//React.FC specify the type of props for a component
const CarbonEmissionChart: React.FC<CarbonEmissionChartProps> = ({ monthlyEmissions, averageAbsorbed }) => {
// Example data for monthly emissions and labels
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Chart.js data object
  const data: ChartData<"bar" | "line", number[], string> = {
    labels,
    datasets: [
      {
        label: 'Total Carbon Emission (kg CO2E)',
        data: monthlyEmissions, //Array of emissions per month
        backgroundColor: 'rgba(192, 245, 143, 0.6)', //'rgba(75, 192, 192, 0.6)',
        borderColor:  'rgba(180, 225, 125, 0/6)', //'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        type : 'bar',
      },
      {
        label: 'Average Carbon Absorbed',
        data: Array(12).fill(averageAbsorbed), //Creates a flat line across all months, threshold
        type: 'line', //specify the dataset as a line type
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false,
        pointRadius: 0, //Hides the data points for the line
      },
    ],
  };

  // Chart.js options object
  const options: any= { //suppress TypeScript's strict typing checks
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Carbon Emission and Average Absorption Line',
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'kg CO2E',} },
      x: { title: { display: true, text: 'Month'} },
    },
  };

  return <Chart type="bar" data={data} options={options} />;
};

export default CarbonEmissionChart;