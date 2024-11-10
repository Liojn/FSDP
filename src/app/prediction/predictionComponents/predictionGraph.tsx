// components/PredictionGraph.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface YearlyData {
    year: number;
    equipment: number[];
    livestock: number[];
    crops: number[];
    waste: number[];
    totalMonthlyEmissions: number[];
    totalMonthlyAbsorption: number[];
    netMonthlyEmissions: number[];
}

interface PredictionGraphProps {
    yearlyData: YearlyData[];
}

const PredictionGraph: React.FC<PredictionGraphProps> = ({ yearlyData }) => {
    // Sort the yearlyData array in ascending order by year
    const sortedYearlyData = yearlyData.sort((a, b) => a.year - b.year);

    const data = {
        labels: sortedYearlyData.map(dataPoint => dataPoint.year.toString()), // Year labels in ascending order
        datasets: [
            {
                label: 'Total Emissions',
                data: sortedYearlyData.map(dataPoint => dataPoint.totalMonthlyEmissions.reduce((a, b) => a + b, 0)),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
            },
            {
                label: 'Total Absorption',
                data: sortedYearlyData.map(dataPoint => dataPoint.totalMonthlyAbsorption.reduce((a, b) => a + b, 0)),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false,
            },
            {
                label: 'Net Emissions',
                data: sortedYearlyData.map(dataPoint => dataPoint.netMonthlyEmissions.reduce((a, b) => a + b, 0)),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Yearly Emissions vs. Absorption',
            },
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)', // Horizontal grid line color
                    lineWidth: 1,
                },
                ticks: {
                    color: '#333', // Darker color for y-axis labels
                },
            },
            x: {
                grid: {
                    display: false, // Disable vertical grid lines
                },
                ticks: {
                    color: '#333', // Darker color for x-axis labels
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export default PredictionGraph;
