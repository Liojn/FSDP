"use client"; // Treat this component as a Client Component

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Define the types for the props
interface LivestockEmissionsGraphContainerProps {
  selectedYear: number;
  dataType: string;
  category: string;
}

const LivestockEmissionsGraphContainer: React.FC<LivestockEmissionsGraphContainerProps> = ({ selectedYear, dataType, category }) => {
  const [monthlyEmissions, setMonthlyEmissions] = useState({
    Cattle: Array(12).fill(0),
    Pig: Array(12).fill(0),
    Goat: Array(12).fill(0),
    Chicken: Array(12).fill(0),
  });

  useEffect(() => {
    const fetchLivestockEmissionsData = async () => {
      if (category !== "livestock") return; // Only fetch if the category is "livestock"
      
      const userName = localStorage.getItem("userName") || "userName";
      try {
        const response = await fetch("/api/statistics/livestockEmission", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "userName": userName,
          },
          body: JSON.stringify({ endYear: selectedYear, dataType: dataType }),
        });

        const data = await response.json();
        console.log("API Response Data:", data); // Debugging log to inspect data

        // Update monthlyEmissions based on response data structure
        setMonthlyEmissions({
          Cattle: data.LSMonthlyData.Cattle || Array(12).fill(0),
          Pig: data.LSMonthlyData.Pig || Array(12).fill(0),
          Goat: data.LSMonthlyData.Goat || Array(12).fill(0),
          Chicken: data.LSMonthlyData.Chicken || Array(12).fill(0),
        });
      } catch (error) {
        console.error("Failed to fetch livestock emissions data:", error);
      }
    };

    fetchLivestockEmissionsData();
  }, [selectedYear, dataType, category]);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Cattle',
        data: monthlyEmissions.Cattle,
        borderColor: '#A0D7E7', // Pastel Blue
        fill: true,
      },
      {
        label: 'Pig',
        data: monthlyEmissions.Pig,
        borderColor: '#F06292', // Lavender
        fill: true,
      },
      {
        label: 'Goat',
        data: monthlyEmissions.Goat,
        borderColor: '#A4DE6C', // Green
        fill: true,
      },
      {
        label: 'Chicken',
        data: monthlyEmissions.Chicken,
        borderColor: '#D2B48C', // Light Pink
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
        text: `Monthly Livestock ${dataType === 'carbon-emissions' ? 'Emissions' : 'Energy Consumption'} for ${selectedYear}`,
        color: 'black',
        align: "start",
        font: { size: 14 },
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

export default LivestockEmissionsGraphContainer;
