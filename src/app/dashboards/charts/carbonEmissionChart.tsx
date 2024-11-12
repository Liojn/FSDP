import React from 'react';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement,  LineElement, PointElement, Title, Tooltip, Legend, ChartData } from 'chart.js';

//Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

type CarbonEmissionChartProps = {
  monthlyEmissions: number[];
  averageAbsorbed: number | null;
  onMonthClick: (month: string | number) => void; // Prop to handle month selection

};

//React.FC specify the type of props for a component
const EmissionCategoryChart: React.FC<CarbonEmissionChartProps> = ({ monthlyEmissions, averageAbsorbed, onMonthClick }) => {
// Example data for monthly emissions and labels
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  //Track which bar was clicked
  const [clickedIndex, setClickedIndex] = React.useState<number | null>(null);

  // Chart.js data object
  const data: ChartData<"bar" | "line", number[], string> = {
    labels,
    datasets: [
      {
        label: 'Total Carbon Emission (kg CO2E)',
        data: monthlyEmissions, //Array of emissions per month
        backgroundColor: monthlyEmissions.map((_, index) => {
          if (index === clickedIndex) {
            return '#4BA387'; //darker shade
          }
          return '#66CDAA' //'rgba(192, 245, 143, 0.6)'; //original color
        }),
        borderColor: '#55B698', //'rgba(180, 225, 125, 0/6)',
        borderWidth: 1,
        type : 'bar',
      },
      /*{ //Delete the straight line threshold for now
        label: 'Total Carbon Absorbed',
        data: Array(12).fill(averageAbsorbed), //Creates a flat line across all months, threshold
        type: 'line', //specify the dataset as a line type
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false,
        pointRadius: 0, //Hides the data points for the line
      },*/
    ],
  };

  // Chart.js options object
  const options: any= { //suppress TypeScript's strict typing checks
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'kg CO2E',} },
      x: { title: { display: true, text: 'Month'} },
    },
    onClick: (event: any) => { //EVENT TRIGGER
      const activePoints = event.chart.getElementsAtEventForMode(event.native, 'nearest', { intersect: true }, false);
      if (activePoints.length > 0) {
        const clickedMonthIndex = activePoints[0].index;
        setClickedIndex(clickedMonthIndex); //store it
        onMonthClick(clickedMonthIndex);
        // Toggle the clicked bar color: if it's clicked again, reset
        if (clickedIndex === clickedMonthIndex) {
          setClickedIndex(null); // Reset if the same bar is clicked
        } else {
          setClickedIndex(clickedMonthIndex); // Set new clicked index
        }
      }
    },

  };

  return <Chart type="bar" data={data} options={options} />;
};

export default EmissionCategoryChart;