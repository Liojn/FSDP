"use client"; // Treat this component as a Client Component

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Define the types for the props
interface CropEmissionGraphContainerProps {
  selectedYear: number;
  dataType: string;
  category: string;
}

const CropEmissionGraphContainer: React.FC<CropEmissionGraphContainerProps> = ({ selectedYear, dataType, category }) => {
  const [monthlyEmissions, setMonthlyEmissions] = useState({
    Vegetable: Array(12).fill(0),
    Rice: Array(12).fill(0),
    Tomato: Array(12).fill(0),
    Corn: Array(12).fill(0),
  });

  useEffect(() => {
    const fetchCropEmissionsData = async () => {
      const userName = localStorage.getItem("userName") || "userName";
      try {
        const response = await fetch("/api/statistics/cropEmission", {
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

        // Update setMonthlyEmissions based on response data structure
        setMonthlyEmissions({
          Vegetable: data.monthlyEmissions.Vegetable || Array(12).fill(0),
          Rice: data.monthlyEmissions.Rice || Array(12).fill(0),
          Tomato: data.monthlyEmissions.Tomato || Array(12).fill(0),
          Corn: data.monthlyEmissions.Corn || Array(12).fill(0),
        });
      } catch (error) {
        console.error("Failed to fetch crop emissions data:", error);
      }
    };

    if (category = "crops") {
      fetchCropEmissionsData();
    }
  }, [selectedYear, dataType, category]);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Vegetable',
        data: monthlyEmissions.Vegetable,
        borderColor: '#A4DE6C', // Green
        fill: true,
      },
      {
        label: 'Rice',
        data: monthlyEmissions.Rice,
        borderColor: '#FF7300', // Orange 
        fill: true,
      },
      {
        label: 'Tomato',
        data: monthlyEmissions.Tomato,
        borderColor: 'red',
        fill: true,
      },
      {
        label: 'Corn',
        data: monthlyEmissions.Corn,
        borderColor: 'yellow',
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
        text: `Monthly Crop ${dataType === 'carbon-emissions' ? 'Emissions' : 'Energy Consumption'} for ${selectedYear}`,
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

export default CropEmissionGraphContainer;
