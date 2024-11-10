"use client"; //treat this component as a Client Component

import React, { useState, useEffect } from 'react';
import { fetchUniqueYears, getMetricsData, EmissionData, fetchMonthlyCarbonEmissions, fetchEmissionTarget, fetchEmissionCategory } from '../api/dashboards/api';
import { MetricCard } from '@/components/shared/metric-card'; //Cards component
import CarbonEmissionChart from '@/app/dashboards/charts/carbonEmissionChart';
import GaugeChartComponent  from "@/app/dashboards/charts/gaugeGoal"; //Porgress Gauge Chart
import EmissionCategoryChart from '@/app/dashboards/charts/emissionCategory';
import { PageHeader } from '@/components/shared/page-header';

/* Define the props interface for BarChart
interface BarChartProps {
  monthlyEmissions: number[];
  averageAbsorbed: number | null;
  handleMonthClick: (month: string | number) => void; // Prop to handle month click

}*/

  
const DashboardPage = () => {

  const [yearFilter, setYearFilter] = useState<string>(''); //Year filter selection, holds the currently selected year from the dropdown. Initially set to an empty string
  const [yearOptions, setYearOptions] = useState<number[]>([]); //store Year options from API fetch, initialized as an empty array,
  const [selectedYear, setSelectedYear] = useState<number | null>(null); //Store selected year for subsequent API calls
  //State for monthly emission
  const [monthlyEmissions, setMonthlyEmissions] = useState<number[]>([]);
  const [averageAbsorbed, setAverageAbsorbed] = useState<number | null>(null);

  //Store the data for current and previous year emissions, GaugeChart
  const [currentYearEmissions, setCurrentYearEmissions] = useState<number | null>(0);
  const [previousYearEmissions, setPreviousYearEmissions] = useState<number | null>(0);
  const [targetGoal, setTargetGoal] = useState<number>(10000); //default first

  // State for storing carbon emissions data for DONUT CHART
  const [CategoryEmissionsData, setCategoryEmissionsData] = useState<any>(null); 
  const [selectedMonth, setSelectedMonth] = useState<number | string>(''); // Track selected month


  const [metricsData, setMetricsData] = useState([ //var to store the data and display, initially predefined
  { title: "Total Energy Consumption", value: "Loading...", unit: "kWh" },
  { title: "Total Carbon Emissions", value: "Loading...", unit: "KG CO2" },
  { title: "Total Net Emission", value: "Loading...", unit: "KG CO2" }
  ]);

  //Fetch the avail list of years from the API
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const companyId = '671cf9a6e994afba6c2f332d'; //Assigned now for simplicity
        const years = await fetchUniqueYears(companyId);
        setYearOptions(years); //Update the year options state, call the function

        //Set the default year to the latest year
        if (years.length > 0) {
          setYearFilter(years[0].toString()); //Set to the latest year as default
          setSelectedYear(years[0]); // Store the selected year
        }
      } catch (error) {
        console.error('Failed to fetch years:', error);
      }
    };

    fetchYears();
  }, []); //Empty dependency array, runs once after render

  //Fetch emission and energy data based on the selected year
  useEffect(() => {
    const fetchMetricsData = async () => {
      if (selectedYear) {
        try {
          const companyId = '671cf9a6e994afba6c2f332d';
          if (yearOptions.includes(selectedYear - 1)) { //range already defined in my options list, this is particularly for gauge
              // If the previous year is available, fetch data for both the current and previous year
              const [data, emissionsData, previousEmissionsData, targetGoal, emissionCategoryData] = await Promise.all([
                  getMetricsData(companyId, selectedYear),
                  fetchMonthlyCarbonEmissions(companyId, selectedYear),
                  getMetricsData(companyId, (selectedYear - 1)), // Fetch the emissions data for the previous year, use the net emission from the cards
                  fetchEmissionTarget(companyId, selectedYear),
                  fetchEmissionCategory(companyId, selectedYear, selectedMonth),
                  console.log(selectedYear -1)
              ]);

              // Process data for both years
              if (data) {
                  setMetricsData([
                      { title: "Total Energy Consumption", value: data["energyAverage in kWh"].toFixed(2), unit: "kWh" },
                      { title: "Total Carbon Emissions", value: data["carbonAverage in CO2E"].toFixed(2), unit: "KG CO2" },
                      { title: "Total Carbon Net Emissions", value: data["netAverage in CO2E"].toFixed(2), unit: "KG CO2" }
                  ]);
                  setCurrentYearEmissions(data["netAverage in CO2E"]); //give the current year net admission
              }

              if (emissionsData) {
                  setMonthlyEmissions(emissionsData.monthlyEmissions); // Set the monthly emissions data for the current year
                  setAverageAbsorbed(emissionsData.averageAbsorb); // Set the average absorbed value for the current year
              }

              if (previousEmissionsData){
                setPreviousYearEmissions(previousEmissionsData["netAverage in CO2E"]); //give the prev year emission
              }

              if (targetGoal) {
                setTargetGoal(targetGoal); //set value
              }
              // Set emission category data (this will be used for charts)
              if (emissionCategoryData) {
                setCategoryEmissionsData(emissionCategoryData); // This is the data you need for the chart
              }
          } else {
              //If the previous year is not available, fetch data only for the current year
              const [data, emissionsData, targetGoal, emissionCategoryData] = await Promise.all([
                  getMetricsData(companyId, selectedYear),
                  fetchMonthlyCarbonEmissions(companyId, selectedYear),
                  fetchEmissionTarget(companyId, selectedYear),
                  fetchEmissionCategory(companyId, selectedYear, selectedMonth)
              ]);

              if (data) {
                  setMetricsData([
                      { title: "Average Energy Consumption", value: data["energyAverage in kWh"].toFixed(2), unit: "kWh" },
                      { title: "Average Carbon Emissions", value: data["carbonAverage in CO2E"].toFixed(2), unit: "KG CO2" },
                      { title: "Average Carbon Net Emissions", value: data["netAverage in CO2E"].toFixed(2), unit: "KG CO2" }
                  ]);
                  setCurrentYearEmissions(data["netAverage in CO2E"]); //give the current year net admission
              }

              if (emissionsData) {
                  setMonthlyEmissions(emissionsData.monthlyEmissions); // Set the monthly emissions data
                  setAverageAbsorbed(emissionsData.averageAbsorb); // Set the average absorbed value
              }
              setPreviousYearEmissions(0); //no data for comparison

              if (targetGoal) {
                setTargetGoal(targetGoal); //set value
              }
              // Set emission category data (this will be used for charts)
              if (emissionCategoryData) {
                setCategoryEmissionsData(emissionCategoryData); // This is the data you need for the chart
              }
          }
          
        } catch (error) {
          console.error("Failed to fetch emission data:", error);
        }
      }
    };

    fetchMetricsData();
  }, [selectedYear, selectedMonth]);

  //Handle year filter change
  const handleYearFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    setYearFilter(event.target.value); //retrieves the selected year, which is then stored in yearFilter
    setSelectedYear(year);
    setSelectedMonth(''); //means all years
  };

  // Handler to toggle month selection
  const handleMonthClick = (month: string | number) => {
    if (selectedMonth === month) {
      setSelectedMonth(''); // If clicked again, clear the selection
    } else {
      setSelectedMonth(month); // Set the selected month
    }
  };

  
  return (
    <div className="pt-0 p-4 space-y-6">
      {/* Dashboard Header */}
      <div className="pt-0 flex justify-between items-center mb-4">
        <PageHeader title='Dashboard' />
        <div> {/*Dropdown menu */}
        <span className="font-semibold">Year: </span>
        <select
          value={yearFilter}
          onChange={handleYearFilterChange} 
          className="bg-white border border-gray-300 rounded-md p-2 text-gray-700"
        >
          <option value="">Select Year</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Metrics and Charts */}
        <div className="md:col-span-2 space-y-6">
          {/* Dashboard Cards for Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricsData.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value === "Loading..." ? metric.value : parseFloat(metric.value)} // condition ? valueIfTrue : valueIfFalse
                unit={metric.unit}
                className="bg-white p-4 shadow-md rounded-lg"
              />
            ))}
          </div>

          {/* Bar Chart: */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Yearly Carbon Emission's Progress
            </h3>
              <div className="bg-white-200 h-full flex justify-center items-center min-h-[350px]">
                <CarbonEmissionChart monthlyEmissions={monthlyEmissions} averageAbsorbed={averageAbsorbed} onMonthClick={handleMonthClick} />
              </div>
          </div>
        </div>

        {/* Right Column: Goal target indicator and by category */}
        <div className="flex flex-col space-y-6 ">
          {/* Additional Gauge Graph */}
          <div className="bg-white p-4 shadow-md rounded-lg h-60 flex flex-col"> 
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex-shrink-0">Net Emission Limit Indicator</h3>
            <div className="flex-1 flex flex-col">
              <div className="bg-white flex-1 flex justify-center items-center pb-4">
                {currentYearEmissions !== null && targetGoal !== null && previousYearEmissions !== null ? ( //prevent early display and disappear the needle
                  <GaugeChartComponent
                    currentYearEmissions={currentYearEmissions || 0}
                    previousYearEmissions={previousYearEmissions || 0}
                    targetGoal={targetGoal || 10000} //default, for now
                  />
                ) : (
                  <div>Loading gauge data...</div>  // Optionally show a loading state
                )}
              </div>
            </div>
          </div>

          {/* Emission Drilldown */}
          <div className="bg-white p-4 shadow-md rounded-lg pb-0">
          <div className="flex justify-between items-center mb-4 pb-0">
            <h3 className="text-lg font-semibold text-gray-700 flex-shrink-0">Emissions By Category</h3>
          </div>
          <div className='flex-1 flex justify-center items-center'>
            <EmissionCategoryChart 
              categoryData={CategoryEmissionsData} month={selectedMonth}
            />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default DashboardPage;