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
// Register necessary components
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

interface CarbonEmissionChartProps {
  monthlyEmissions: number[];
  averageAbsorbed: number | null;
  onMonthClick: (monthIndex: number) => void;
  clickedMonthIndex: number | null;
}

const CarbonEmissionChart: React.FC<CarbonEmissionChartProps> = ({
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

  const data: ChartData<"bar" | "line", number[], string> = {
    labels,
    datasets: [
      {
        label: "Total Carbon Emission (kg CO2E)",
        data: monthlyEmissions,
        backgroundColor: monthlyEmissions.map((_, index) =>
          index === clickedMonthIndex ? "#4BA387" : "#66CDAA"
        ),
        hoverBackgroundColor: "#448C7A",
        type: "bar",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "kg CO2E",
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
    },
    onClick: (event: any) => {
      const chart = event.chart;
      const points = chart.getElementsAtEventForMode(
        event,
        "nearest",
        { intersect: true },
        false
      );

      if (points.length > 0) {
        const clickedMonthIndex = points[0].index;
        onMonthClick(clickedMonthIndex);
      }
    },
    onHover: (event: any, elements: any[]) => {
      const canvas = event.native?.target;
      if (canvas) {
        canvas.style.cursor = elements.length ? "pointer" : "default";
      }
    },
  };

  return <Chart type="bar" data={data} options={options} />;
};

export default CarbonEmissionChart;
