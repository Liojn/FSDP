"use client";

import { useState, useEffect } from "react";
import {
  fetchUniqueYears,
  getMetricsData,
  fetchMonthlyCarbonEmissions,
  fetchEmissionTarget,
  fetchEmissionCategory,
} from "../../api/dashboards/api";
import { 
  ScopeThreshold, 
  MetricData, 
  EmissionCategoryData,
  TargetGoalResponse,
  MetricsDataResponse,
  EmissionsDataResponse,
  MetricsUpdateParams,
} from "../types";
import { 
  DEFAULT_DESCRIPTIONS, 
  DEFAULT_METRICS 
} from "../constants";


export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>("");
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | string>("");
  const [userId, setUserId] = useState<string | null>(null);

  // State for metrics and emissions
  const [monthlyEmissions, setMonthlyEmissions] = useState<number[]>([]);
  const [averageAbsorbed, setAverageAbsorbed] = useState<number | null>(null);
  const [currentYearEmissions, setCurrentYearEmissions] = useState<number | null>(0);
  const [previousYearEmissions, setPreviousYearEmissions] = useState<number | null>(0);
  const [targetGoal, setTargetGoal] = useState<number>(10000);
  const [isEarliestYear, setIsEarliestYear] = useState<boolean>(false);
  const [firstYearGoal, setFirstYearGoal] = useState<number>(0);

  const [categoryEmissionsData, setCategoryEmissionsData] = useState<EmissionCategoryData[] | null>(null);
  const [metricsData, setMetricsData] = useState<MetricData[]>(DEFAULT_METRICS);
  const [thresholds, setThresholds] = useState<ScopeThreshold[]>([]);

  // Fetch years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          const years = await fetchUniqueYears(storedUserId);
          setYearOptions(years);

          if (years.length > 0) {
            setYearFilter(years[0].toString());
            setSelectedYear(years[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch years:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  // Fetch metrics data
  useEffect(() => {
    const fetchMetricsData = async () => {
      if (selectedYear && userId) {
        setLoading(true);
        try {
          const companyId = userId;
          const fetchPromises = yearOptions.includes(selectedYear - 1)
            ? Promise.all([
                getMetricsData(companyId, selectedYear),
                fetchMonthlyCarbonEmissions(companyId, selectedYear),
                getMetricsData(companyId, selectedYear - 1),
                fetchEmissionTarget(companyId, selectedYear),
                fetchEmissionCategory(companyId, selectedYear, selectedMonth),
              ])
            : Promise.all([
                getMetricsData(companyId, selectedYear),
                fetchMonthlyCarbonEmissions(companyId, selectedYear),
                fetchEmissionTarget(companyId, selectedYear),
                fetchEmissionCategory(companyId, selectedYear, selectedMonth),
              ]);

          const results = await fetchPromises;
          const updateParams: MetricsUpdateParams = yearOptions.includes(selectedYear - 1)
            ? {
                data: results[0] as MetricsDataResponse,
                emissionsData: results[1] as EmissionsDataResponse,
                previousEmissionsData: results[2] as MetricsDataResponse,
                targetGoalData: results[3] as TargetGoalResponse,
                emissionCategoryData: results[4] as EmissionCategoryData[],
              }
            : {
                data: results[0] as MetricsDataResponse,
                emissionsData: results[1] as EmissionsDataResponse,
                previousEmissionsData: null,
                targetGoalData: results[2] as TargetGoalResponse,
                emissionCategoryData: results[3] as EmissionCategoryData[],
              };

          updateMetricsData(updateParams);
        } catch (error) {
          console.error("Failed to fetch emission data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMetricsData();
  }, [selectedYear, userId, yearOptions]);

  // Fetch metrics data for the filtered DONUT CHART
  useEffect(() => {
    const fetchMetricsData = async () => {
      if (selectedYear && userId) {
        try {
          const companyId = userId;
          const fetchPromises = fetchEmissionCategory(companyId, selectedYear, selectedMonth);
          const results = await fetchPromises;
          setCategoryEmissionsData(results);
        } catch (error) {
          console.error("Failed to fetch emission data:", error);
        }
      }
    };

    fetchMetricsData();
  }, [selectedMonth]);

  // Update metrics data
  const updateMetricsData = ({
    data,
    emissionsData,
    previousEmissionsData,
    targetGoalData,
    emissionCategoryData,
  }: MetricsUpdateParams) => {
    if (data) {
      const newMetricsData: MetricData[] = [
        {
          title: "Total Energy Consumption",
          value: data["energyAverage in kWh"].toFixed(0),
          unit: "kWh",
        },
        {
          title: "Total Net Carbon Emissions",
          value: data["carbonAverage in CO2E"].toFixed(0),
          unit: "KG CO2",
        },
        {
          title: "Total Carbon Neutral Emissions",
          value: data["netAverage in CO2E"].toFixed(0),
          unit: "KG CO2",
        },
      ];

      setMetricsData(newMetricsData);
      setCurrentYearEmissions(data["carbonAverage in CO2E"]);
    }

    if (emissionsData) {
      setMonthlyEmissions(emissionsData.monthlyEmissions);
      setAverageAbsorbed(emissionsData.averageAbsorb);
    }

    setPreviousYearEmissions(
      previousEmissionsData ? previousEmissionsData["carbonAverage in CO2E"] : 0
    );

    if (targetGoalData) {
      setTargetGoal(targetGoalData.target);
      setIsEarliestYear(targetGoalData.isEarliestYear);
      setFirstYearGoal(targetGoalData.firstYearGoal);
    }

    if (emissionCategoryData) {
      setCategoryEmissionsData(emissionCategoryData);
    }
  };

  // Handlers
  const handleYearFilterChange = (value: string) => {
    const year = parseInt(value, 10);
    setYearFilter(value);
    setSelectedYear(year);
    setSelectedMonth("");
  };

  const handleMonthClick = (month: string | number) => {
    setSelectedMonth(selectedMonth === month ? "" : month);
  };

  return {
    loading,
    yearFilter,
    yearOptions,
    selectedYear,
    selectedMonth,
    userId,
    monthlyEmissions,
    averageAbsorbed,
    currentYearEmissions,
    previousYearEmissions,
    targetGoal,
    isEarliestYear,
    firstYearGoal,
    categoryEmissionsData,
    metricsData,
    thresholds,
    handleYearFilterChange,
    handleMonthClick,
  };
};