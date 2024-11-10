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
        label: 'Carbon Emissions (%)',
        data: [
          emissions.fuel?.emission || 0,
          emissions.electricity?.emission || 0,
          emissions.livestock?.emission || 0,
          emissions.waste?.emission || 0,
          emissions.crops?.emission || 0,
        ],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'],
        hoverBackgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'],
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
            const emissionValue = Number(emission); // Convert to number if needed

            // Calculate percentage for the current category
            const percentage = totalEmission > 0 ? ((emissionValue / totalEmission) * 100).toFixed(0) : '0.00';

            // Only show additional info if the month is selected (not null or empty)
            const additionalInfo = month
              ? `Details:\n${getCategoryDetails(category)}`
              : '';

            return `${percentage}% ${additionalInfo}`;
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
        return `Fuel Type: ${details.fuelType}, Amount Used: ${details.amountUsed.toFixed(1)}`;
      case 'electricity':
        return `Amount Used: ${details.amountUsed.toFixed(1)} kWh`;
      case 'crops':
        return `Crop Type: ${details.cropType}, Fertilizer Used: ${details.fertilizerUsed.toFixed(1)} kg`;
      case 'waste':
        return `Waste Type: ${details.wasteType}, Amount: ${details.amount.toFixed(1)} kg`;
      case 'livestock':
        return `Animal Type: ${details.animalType}, Amount: ${details.amount.toFixed(1)} units`;
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
