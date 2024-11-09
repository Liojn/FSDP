// Updated PlannerCharts to include more strategic insights and benchmarking comparisons

"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Sample data with added milestones, forecasts, and benchmarks
const monthlyData = [
  {
    month: "Jan",
    emissions: 65,
    efficiency: 75,
    forecastEmissions: 60,
    forecastEfficiency: 78,
    milestones: 1,
  },
  {
    month: "Feb",
    emissions: 59,
    efficiency: 78,
    forecastEmissions: 57,
    forecastEfficiency: 80,
    milestones: 2,
  },
  {
    month: "Mar",
    emissions: 80,
    efficiency: 72,
    forecastEmissions: 78,
    forecastEfficiency: 75,
    milestones: 3,
  },
  {
    month: "Apr",
    emissions: 81,
    efficiency: 70,
    forecastEmissions: 79,
    forecastEfficiency: 73,
    milestones: 2,
  },
  {
    month: "May",
    emissions: 56,
    efficiency: 85,
    forecastEmissions: 55,
    forecastEfficiency: 87,
    milestones: 4,
  },
  {
    month: "Jun",
    emissions: 55,
    efficiency: 87,
    forecastEmissions: 53,
    forecastEfficiency: 90,
    milestones: 3,
  },
];

const departmentData = [
  { department: "Operations", score: 78, target: 80, forecast: 82 },
  { department: "Logistics", score: 65, target: 70, forecast: 68 },
  { department: "Production", score: 83, target: 85, forecast: 86 },
  { department: "Facilities", score: 72, target: 75, forecast: 74 },
];

export function PlannerCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Monthly Trends with Milestones and Forecasts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Monthly Trends and Strategic Forecasts
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="emissions"
                stroke="#ef4444"
                name="Emissions"
              />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#22c55e"
                name="Efficiency"
              />
              <Line
                type="monotone"
                dataKey="forecastEmissions"
                stroke="#ffbb33"
                strokeDasharray="5 5"
                name="Forecast Emissions"
              />
              <Line
                type="monotone"
                dataKey="forecastEfficiency"
                stroke="#66c2ff"
                strokeDasharray="5 5"
                name="Forecast Efficiency"
              />
              <Line
                type="monotone"
                dataKey="milestones"
                stroke="#000"
                strokeDasharray="3 4"
                name="Milestones"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Department Performance with Strategic Comparison and Forecast */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Department Performance with Benchmarks and Forecast
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#3b82f6" name="Current Score" />
              <Bar dataKey="target" fill="#10b981" name="Target Score" />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#ff8c00"
                name="Forecasted Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default PlannerCharts;