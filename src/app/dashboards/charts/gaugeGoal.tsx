import React from 'react';
import GaugeChart from 'react-gauge-chart';

type GaugeChartProps = {
  currentYearEmissions: number;
  previousYearEmissions: number;
  targetReduction: number;
  initialYearGoal: number; // prop for initial year target, at the first signup
  isEarliestYear: boolean; // New prop to check if it's the earliest year
};

const GaugeChartComponent: React.FC<GaugeChartProps> = ({
  currentYearEmissions,
  previousYearEmissions,
  targetReduction,
  initialYearGoal,
  isEarliestYear,
}) => {
  let percentageChange = 0;
  let comparisonMessage = '';
  let arrow = '';
  console.log(targetReduction);
  console.log(initialYearGoal);
  console.log(previousYearEmissions);
  console.log(currentYearEmissions);
  //Calculate percentage change based on whether it's the earliest year or not
  if (isEarliestYear) {
    // For earliest year, calculate against initialYearGoal
    percentageChange = ((currentYearEmissions - initialYearGoal) / initialYearGoal) * 100;
    const baseline = initialYearGoal;
    if (currentYearEmissions > baseline) {
      comparisonMessage = `carbons exceeded from initial goal set.`;
      arrow = '⬆';
    } else if (currentYearEmissions < baseline) {
      comparisonMessage = `carbons left from initial goal set.`;
      arrow = '⬇';
    } else {
      comparisonMessage = "Same as initial goal.";
      arrow = '';
    }
  } else if (previousYearEmissions !== 0) {
    // For other years, use the existing calculation
    const baseline = (previousYearEmissions * (1 - targetReduction));
    percentageChange = ((currentYearEmissions - baseline) / baseline) * 100;
    console.log(percentageChange);

    if (currentYearEmissions > baseline) {
      comparisonMessage = `carbons exceeded from goal set.`;
      arrow = '⬆';
    } else if (currentYearEmissions < baseline) {
      comparisonMessage = `carbons left from goal set.`;
      arrow = '⬇';
    } else {
      comparisonMessage = "Same as goal target.";
      arrow = '';
    }
  }

  // Calculate target goal based on whether it's the earliest year
  let targetGoal;
  let gaugeValue;
  if (isEarliestYear) {
    targetGoal = initialYearGoal;
    gaugeValue = Math.min(currentYearEmissions, targetGoal);
  } else if (previousYearEmissions !== 0) {
    targetGoal = (1 - targetReduction) * previousYearEmissions;
    gaugeValue = Math.min(currentYearEmissions, targetGoal);
  } else {
    targetGoal = 10000;
    gaugeValue = 0;
  }

  const max = targetGoal;

  return (
    <div>      
      <GaugeChart
        id="gauge-chart"
        nrOfLevels={100}
        arcsLength={[0.6, 0.3, 0.1]}
        colors={['#66CDAA', '#FFB347', '#FF6B6B']}
        percent={gaugeValue / max}
        arcWidth={0.2}
        textColor="#000000"
        formatTextValue={(gaugeValue) => `${gaugeValue}% used`}
      />
      
      {(previousYearEmissions !== 0 || isEarliestYear) ? (
        <p>
          <span 
            style={{
              color: percentageChange > 0 ? 'red' : 'green',
            }}
          >
            {arrow} {Math.abs(percentageChange).toFixed(1)}%
          </span>
          <span> {comparisonMessage}</span>
        </p>
      ) : (
        <p>{comparisonMessage}</p>
      )}
    </div>
  );
};

export default GaugeChartComponent;