import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define types for the data prop
interface MachineryData {
  name: string;
  consumption: number;
}

interface ChartProps {
  data: MachineryData[]; // Accept data as prop
}

const ElectricityConsumptionChart: React.FC<ChartProps> = ({ data }) => {
  if (!Array.isArray(data)) {
    console.log(data);
    console.error('Expected an array for data, but got:', data);
    return <div>Invalid data</div>;
  }
  const chartData = {
    labels: data.map(item => item.name), // Map machine names to labels
    datasets: [
      {
        label: 'Electricity Consumption (kWh)',
        data: data.map(item => item.consumption), // Map consumption values
        backgroundColor: [ "#C0F58F", "#F59E0B", "#3B82F6"], // Custom colors
        borderRadius: 2,
        barThickness: 30,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.raw} kWh`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '256px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ElectricityConsumptionChart;
