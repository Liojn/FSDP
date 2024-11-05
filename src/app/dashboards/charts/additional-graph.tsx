import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AdditionalGraphProps {
  currentTotal: number;
  goal: number;
}

const AdditionalGraph: React.FC<AdditionalGraphProps> = ({ currentTotal, goal }) => {
  const percentage = (currentTotal / goal) * 100;
  const isGoalExceeded = percentage > 100;

  const data = {
    datasets: [
      {
        data: isGoalExceeded ? [100, 0] : [percentage, 100 - percentage],
        backgroundColor: isGoalExceeded ? ['#FF4D4D', '#FF4D4D'] : ['#4CAF50', '#E5E5E5'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: '80%', // Makes it a hollow center
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-lg h-60 flex flex-col items-center justify-center">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Overall Net Carbon Emissions</h3>
      <div className="relative w-32 h-32 flex items-center justify-center">
        <Pie data={data} options={options} />
        <div className="absolute flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color: isGoalExceeded ? '#FF4D4D' : '#4CAF50' }}>{percentage.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default AdditionalGraph;
