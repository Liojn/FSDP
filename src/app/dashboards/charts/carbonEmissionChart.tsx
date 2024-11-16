/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";

//Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

type CarbonEmissionChartProps = {
  monthlyEmissions: number[];
  averageAbsorbed: number | null;
  onMonthClick: (monthIndex: number) => void;
  clickedMonthIndex: number | null; // Add this prop
};

//React.FC specify the type of props for a component
const EmissionCategoryChart: React.FC<CarbonEmissionChartProps> = ({
  monthlyEmissions,
  onMonthClick,
  clickedMonthIndex,
}) => {
  // Example data for monthly emissions and labels
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Chart.js data object
  const data: ChartData<"bar" | "line", number[], string> = {
    labels,
    datasets: [
      {
        label: "Total Carbon Emission (kg CO2E)",
        data: monthlyEmissions,
        backgroundColor: monthlyEmissions.map((_, index) => {
          if (index === clickedMonthIndex) {
            return "#4BA387"; // Highlighted color
          }
          return "#66CDAA"; // Original color
        }),
        hoverBackgroundColor: "#448C7A",
        type: "bar",
      },
    ],
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "kg CO2E" } },
      x: { title: { display: true, text: "Month" } },
    },
    onClick: (event: any) => {
      const activePoints = event.chart.getElementsAtEventForMode(
        event.native,
        "nearest",
        { intersect: true },
        false
      );
      if (activePoints.length > 0) {
        const clickedMonthIndex = activePoints[0].index;
        onMonthClick(clickedMonthIndex);
      }
    },
    onHover: (event: any, elements: any[]) => {
      const canvas = event.native.target;
      canvas.style.cursor = elements.length ? "pointer" : "default";
    },
  };

  return <Chart type="bar" data={data} options={options} />;
};

export default EmissionCategoryChart;
