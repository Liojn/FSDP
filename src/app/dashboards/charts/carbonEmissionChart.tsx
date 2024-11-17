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
  onMonthClick: (month: number) => void;
  clickedMonthIndex: number | string | null; // Updated to include string type
};

const EmissionCategoryChart: React.FC<CarbonEmissionChartProps> = ({
  monthlyEmissions,
  onMonthClick,
  clickedMonthIndex,
}) => {
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

  const parsedIndex = parseInt(clickedMonthIndex as string, 10);
  const data: ChartData<"bar", number[], string> = {
    labels,
    datasets: [
      {
        label: "Total Carbon Emission (kg CO2E)",
        data: monthlyEmissions,
        backgroundColor: monthlyEmissions.map((_, index) => {
          if (isNaN(parsedIndex)) {
            return "#66CDAA"; // Default color when nothing is selected
          }
          return index === parsedIndex ? "#4BA387" : "#66CDAA";
        }),
        hoverBackgroundColor: "#448C7A",
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
        const selectedMonthIndex = activePoints[0].index;
        onMonthClick(selectedMonthIndex);
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
