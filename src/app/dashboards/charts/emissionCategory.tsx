//Component Donut Chart for Dashboard
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface EmissionsChartProps {
  categoryData: any; // The category data passed from the parent
  month: number | string; // The selected month (if not selected, it will be null or undefined)
  onCategoryClick: (category: string, details: string) => void;
}

const EmissionCategoryChart: React.FC<EmissionsChartProps> = ({
  categoryData,
  month,
  onCategoryClick,
}) => {
  // If the data is null or undefined, render loading state
  if (!categoryData) {
    return <div>Loading data...</div>;
  }

  // Destructure data safely with optional chaining
  const emissions = categoryData.carbonEmissions || {}; // Fallback to empty object if no data

  // Prepare data for the chart
  const totalEmission =
    (emissions.fuel?.emission || 0) +
    (emissions.electricity?.emission || 0) +
    (emissions.livestock?.emission || 0) +
    (emissions.waste?.emission || 0) +
    (emissions.crops?.emission || 0);

  const data: ChartData<'doughnut'> = {
    labels: ['Fuel', 'Electricity', 'Livestock', 'Waste', 'Crops'],
    datasets: [
      {
        label: 'Carbon Emissions (KGCO2)',
        data: [
          emissions.fuel?.emission || 0,
          emissions.electricity?.emission || 0,
          emissions.livestock?.emission || 0,
          emissions.waste?.emission || 0,
          emissions.crops?.emission || 0,
        ],
        backgroundColor: [ '#4B9A8D', '#C0F58F', '#2BAEAB', '#A7D8B8', '#F2D9A0'],
        hoverBackgroundColor: ['#3F8277', '#A5D67A', '#249492', '#8EBB9C', '#D1BC87'],
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    ],
  };

  // Options for the chart, including tooltips
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const category = tooltipItem.label || ''; // Tooltip label (category name)
            const emission = tooltipItem.raw || 0; // Tooltip value (emission value)

             // Ensure emission is a number before calculation
            const emissionValue = Number(emission).toFixed(0); // Convert to number if needed


            // Show hover msg if the month is selected (not null or empty)
            return `${emissionValue}kg CO2E. Click for in depth breakdown`;
          },
        },
        // Customize the appearance of the tooltip
        boxWidth: 10,
        bodyFont: {
          size: 12,
          family: 'Arial, sans-serif',
        },
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        // Customize how tooltips are positioned (left, right, top, bottom)
        position: 'nearest',
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const category = data.labels ? (data.labels[index] as string) : '';
        const details = getCategoryDetails(category);
        onCategoryClick(category, details); // Pass the category and details to the parent
      }
    },
    onHover: (event: any, elements: any[]) => {
      // Change cursor to pointer when hovering over bars
      const canvas = event.native.target;
      canvas.style.cursor = elements.length ? 'pointer' : 'default';
    },
  };

  // Function to get category details if month is provided
  const getCategoryDetails = (category: string) => {
    const categoryInfo = emissions[category.toLowerCase()];
    if (!categoryInfo || !categoryInfo.details) {
      return 'No details available';
    }

    // Format details based on category type
    const details = categoryInfo.details;
    switch (category.toLowerCase()) {
      case 'fuel':
        return `Type: ${details.fuelType}, Amount Used: ${details.amountUsed.toFixed(1)}`;
      case 'electricity':
        return `Amount Used: ${details.amountUsed.toFixed(1)} kWh`;
      case 'crops':
        return `Type: ${details.cropType}, Fertilizer Used: ${details.fertilizerUsed.toFixed(1)} kg`;
      case 'waste':
        return `Type: ${details.wasteType}, Amount: ${details.amount.toFixed(1)} kg`;
      case 'livestock':
        return `Type: ${details.animalType}, Amount: ${details.amount.toFixed(1)} units`;
      default:
        return 'No additional details available';
    }
  };

  return (
    <div className="pt-0 min-h-[350px]">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default EmissionCategoryChart;
