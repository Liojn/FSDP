"use client"; // Treat this component as a Client Component

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Define the types for the props
interface EquipmentLineChartContainerProps {
  selectedYear: number;
  dataType: string;
  category: string;
}

const EquipmentLineChartContainer: React.FC<EquipmentLineChartContainerProps> = ({ selectedYear, dataType, category }) => {
  const [monthlyEmissions, setMonthlyEmissions] = useState({
    dieselEmissions: Array(12).fill(0),
    propaneEmissions: Array(12).fill(0),
    naturalGasEmissions: Array(12).fill(0),
    biodieselEmissions: Array(12).fill(0),
    gasolineEmissions: Array(12).fill(0),
    electricityEmissions: Array(12).fill(0),
    energyConsumption: Array(12).fill(0),
  });

  useEffect(() => {
    const fetchEquipmentEmissionsData = async () => {
      const userName = localStorage.getItem("userName") || "userName";
      try {
        const response = await fetch("/api/statistics/equipmentEmission", {
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
        // Update monthlyEmissions based on response data structure
        setMonthlyEmissions({
          dieselEmissions: data.equipmentMonthlyData.dieselEmissions || Array(12).fill(0),
          propaneEmissions: data.equipmentMonthlyData.propaneEmissions || Array(12).fill(0),
          naturalGasEmissions: data.equipmentMonthlyData.naturalGasEmissions || Array(12).fill(0),
          biodieselEmissions: data.equipmentMonthlyData.biodieselEmissions || Array(12).fill(0),
          gasolineEmissions: data.equipmentMonthlyData.gasolineEmissions || Array(12).fill(0),
          electricityEmissions: data.equipmentMonthlyData.electricityEmissions || Array(12).fill(0),
          energyConsumption: data.equipmentMonthlyData.energyConsumption || Array(12).fill(0),
        });
      } catch (error) {
        console.error("Failed to fetch equipment emissions data:", error);
      }
    };

    if (category === "equipment") {
      fetchEquipmentEmissionsData();
    }
  }, [selectedYear, dataType, category]);

  // Prepare chart data based on dataType
  const chartData = {
    labels: months,
    datasets: dataType === 'carbon-emissions'
      ? [
          {
            label: 'Diesel           ',
            data: monthlyEmissions.dieselEmissions,
            borderColor: '#A0D7E7', // Pastel Blue
            fill: true,
          },
          {
            label: 'Propane           ',
            data: monthlyEmissions.propaneEmissions,
            borderColor: '#C5A5E6', // Lavender
            fill: true,
          },
          {
            label: 'Natural Gas           ',
            data: monthlyEmissions.naturalGasEmissions,
            borderColor: '#FFC658', // Yellow
            fill: true,
          },
          {
            label: 'Biodiesel           ',
            data: monthlyEmissions.biodieselEmissions,
            borderColor: '#FF7300', // Orange
            fill: true,
          },
          {
            label: 'Gasoline           ',
            data: monthlyEmissions.gasolineEmissions,
            borderColor: '#4dc0b5', // Teal
            fill: true,
          },
          {
            label: 'Electricity           ',
            data: monthlyEmissions.electricityEmissions,
            borderColor: '#A4DE6C', // Green
            fill: true,
          },
        ]
      : [
          {
            label: 'Electricity',
            data: monthlyEmissions.energyConsumption,
            borderColor: '#8884d8', // Light Purple
            fill: true,
          }
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
        text: `Monthly Equipment ${dataType === 'carbon-emissions' ? 'Emissions' : 'Energy Consumption'} for ${selectedYear}`,
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

export default EquipmentLineChartContainer;
