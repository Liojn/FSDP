"use client"; // Treat this component as a Client Component

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Define the types for the props
interface LineGraphContainerProps {
  selectedYear: number;
  dataType: string;
  category: string;
}

const LineGraphContainer: React.FC<LineGraphContainerProps> = ({ selectedYear, dataType, category }) => {
  const [monthlyData, setMonthlyData] = useState({
    equipment: Array(12).fill(0),
    livestock: Array(12).fill(0),
    crops: Array(12).fill(0),
    waste: Array(12).fill(0),
  });

  useEffect(() => {
    const fetchMonthlyData = async () => {
      const userName = localStorage.getItem("userName") || "userName";
      try {
        const response = await fetch("/api/statistics/monthlyImpact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "userName": userName,
          },
          body: JSON.stringify({
            endYear: selectedYear,
            dataType: dataType,
          }),
        });

        const data = await response.json();
        // console.log("API Response Data:", data); // Debugging log to inspect data

        // Check structure and update setMonthlyData accordingly
        setMonthlyData({
          equipment: data.monthlyData.equipment || Array(12).fill(0),
          livestock: data.monthlyData.livestock || Array(12).fill(0),
          crops: data.monthlyData.crops || Array(12).fill(0),
          waste: data.monthlyData.waste || Array(12).fill(0)
        });
      } catch (error) {
        console.error("Failed to fetch monthly data:", error);
      }
    };

    if (category === "all") {
      fetchMonthlyData();
    }
  }, [selectedYear, dataType, category]);

  const chartData = {
    labels: months,
    datasets: [
        {
        label: 'Equipment',
        data: monthlyData.equipment,
        borderColor: '#FF7300', // Orange ', 
        fill: true,
        },
        {
        label: 'Livestock',
        data: monthlyData.livestock,
        borderColor: '#8884d8', 
        fill: true,
        },
        {
        label: 'Crops',
        data: monthlyData.crops,
        borderColor: '#A4DE6C', // Green
        fill: true,
        },
        {
        label: 'Waste',
        data: monthlyData.waste,
        borderColor: 'brown', 
        fill: true,
        },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Monthly Data ${dataType === 'carbon-emissions' ? 'Emissions' : 'Energy Consumption'} for ${selectedYear} (All Categories)`,
        color: 'black',
        align: "start",
        font: {size: 14,},
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        title: {
          display: true,
          text: dataType === 'carbon-emissions' ? 'Emissions (kg CO2)' : 'Energy Consumption (kWh)',
        },
      },
    },
  };

  return (
    <div className="flex flex-col w-full h-full mt-3">
      <div className="h-full flex justify-center items-center rounded-lg p-4">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineGraphContainer;
