"use client"; // Treat this component as a Client Component

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Define the types for the props
interface WasteEmissionGraphContainerProps {
  selectedYear: number;
  dataType: string;
  category: string;
}

const WasteEmissionGraphContainer: React.FC<WasteEmissionGraphContainerProps> = ({ selectedYear, dataType, category }) => {
  const [monthlyEmissions, setMonthlyEmissions] = useState({
    Manure: Array(12).fill(0),
    YardWaste: Array(12).fill(0),
  });

  useEffect(() => {
    const fetchWasteEmissionsData = async () => {
      const userName = localStorage.getItem("userName") || "userName";
      try {
        const response = await fetch("/api/statistics/wasteEmission", {
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
          Manure: data.wasteMonthlyData.manure || Array(12).fill(0),
          YardWaste: data.wasteMonthlyData.yardWaste || Array(12).fill(0),
        });
      } catch (error) {
        console.error("Failed to fetch waste emissions data:", error);
      }
    };

    if (category === "waste") {
      fetchWasteEmissionsData();
    }
  }, [selectedYear, dataType, category]);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Manure',
        data: monthlyEmissions.Manure,
        borderColor: '#8B4513', // Brown color for Manure
        fill: true,
      },
      {
        label: 'Yard Waste',
        data: monthlyEmissions.YardWaste,
        borderColor: '#228B22', // Forest Green for Yard Waste
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
        text: `Monthly Waste ${dataType === 'carbon-emissions' ? 'Emissions' : 'Energy Consumption'} for ${selectedYear}`,
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

export default WasteEmissionGraphContainer;
