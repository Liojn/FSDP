import React from 'react';
import GaugeChart from 'react-gauge-chart';

type GaugeChartProps = {
  currentYearEmissions: number; // Emissions for the current year
  previousYearEmissions: number; // Emissions for the previous year
  targetGoal: number; // Target goal for the current year
};

const GaugeChartComponent: React.FC<GaugeChartProps> = ({
  currentYearEmissions,
  previousYearEmissions,
  targetGoal,
}) => {
  //Calculate percentage change from previous year to current year
  let percentageChange = 0;
  let comparisonMessage = '';
  let arrow = ''; // Variable to hold the arrow direction

  if (previousYearEmissions !== 0) {
    //Calculate percentage change from previous year
    percentageChange = ((currentYearEmissions - previousYearEmissions) / previousYearEmissions) * 100;

    //Build the comparison message based on whether current year emission is higher or lower
    if (currentYearEmissions > previousYearEmissions) {
      comparisonMessage = `carbons emitted than last year.`;
      arrow = '⬆'; // Up arrow for higher emissions
    } else if (currentYearEmissions < previousYearEmissions) {
      comparisonMessage = `carbons emitted than last year.`;
      arrow = '⬇'; // Down arrow for lower emissions
    } else {
      comparisonMessage = "Same as last year.";
      arrow = ''; // No arrow for same emissions
    }
  } else {
    // If no previous year data is available msg
    comparisonMessage = "No previous year data available";
    arrow = ''; // No arrow if no data
    percentageChange = 0;

  }

  //Ensure the gauge value does not exceed the target goal
  const gaugeValue = Math.min(currentYearEmissions, targetGoal); //Do not let gauge to exceed the target
  const max = targetGoal; // Maximum value for the gauge (target)

  return (
    <div>      
      <GaugeChart
        id="gauge-chart"
        nrOfLevels={100}  
        arcsLength={[0.6, 0.3, 0.1]}  // Green, Yellow, Red
        colors={['#A0CD78', '#ffcc00', '#dc3545']} //Green for below target, Yellow for warning, Red for exceeding target
        percent={gaugeValue / max} // Set the percentage based on current year emissions vs target
        arcWidth={0.2} // Set the width of the gauge arc
        textColor="#000000" // Color of the text
      />
      
      {/* Only display the comparison and percentage if previous year data avail */}
      {previousYearEmissions !== 0 ? (
        <p>
          <span 
            style={{
              color: percentageChange > 0 ? 'red' : 'green',
            }}
          >
            {arrow} {Math.abs(percentageChange).toFixed(2)}%
          </span>
          <span> {comparisonMessage}</span>
        </p>
      ) : (
        //If no previous data then display the message for no comparison
        <p>{comparisonMessage}</p>
      )}
    </div>
  );
};

export default GaugeChartComponent;