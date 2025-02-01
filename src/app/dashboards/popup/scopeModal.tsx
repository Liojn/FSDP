import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { ThresholdEmissionData } from "@/app/dashboards/types";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
} from "../utils/scopeCalculations";
import RecommendationAlert from "@/app/dashboards/components/RecommendationAlert";

interface ScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ThresholdEmissionData | null;
  thresholds: { scope: string; value: number; description: string }[];
  exceedingScopes: string[];
  onViewRecommendations: (scopes: string[]) => void;
  year: number | string | null;
  month: number | string | null;
}

const ScopeModal = ({
  isOpen,
  onClose,
  data,
  exceedingScopes,
  onViewRecommendations,
  year,
  month,
}: ScopeModalProps) => {
  if (!isOpen || !data) {
    return null;
  }

  console.log("ScopeModal opened with data:", data);

  // Convert year and month to numbers or use defaults
  const displayYear = year ? Number(year) : new Date().getFullYear();
  const displayMonth = month ? Number(month) : undefined;

  // Add safety checks for scope calculations
  const scope1 = Number(calculateScope1(data)) || 0;
  const scope2 = Number(calculateScope2(data)) || 0;
  const scope3 = Number(calculateScope3(data)) || 0;

  console.log("Scope 1 value:", scope1);
  console.log("Scope 2 value:", scope2);
  console.log("Scope 3 value:", scope3);

  const totalEmissions = scope1 + scope2 + scope3 || 0;

  const scopeData = [
    {
      name: "Scope 1",
      value: scope1,
      description: "Direct emissions from owned or controlled sources",
    },
    {
      name: "Scope 2",
      value: scope2,
      description: "Indirect emissions from purchased electricity",
    },
    {
      name: "Scope 3",
      value: scope3,
      description: "All other indirect emissions in value chain",
    },
  ].filter((item) => item.value > 0);

  const COLORS = ["#4ade80", "#60a5fa", "#f472b6"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-5 max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✖
        </button>

        <div className="mb-3">
          <h2 className="text-xl font-bold">
            Carbon Emissions Breakdown {displayYear}
            {displayMonth ? `/${displayMonth}` : ""}
          </h2>
          {totalEmissions > 0 ? (
            <p className="text-gray-600 mt-1">
              Total emissions: {totalEmissions.toFixed(2)} KG CO2e
            </p>
          ) : (
            <p className="text-gray-500 mt-1">No emissions data available</p>
          )}
        </div>

        {exceedingScopes.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="inline-block text-red-500 mr-2" />
            <span>Exceeding thresholds in: {exceedingScopes.join(", ")}</span>
          </div>
        )}

        <RecommendationAlert
          exceedingScopes={exceedingScopes}
          onViewRecommendations={onViewRecommendations}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          {scopeData.map((scope, index) => (
            <div key={scope.name} className="p-4 border rounded-lg shadow-sm">
              <h3 className="font-semibold text-sm mb-2">{scope.name}</h3>
              <p
                className="text-2xl font-bold"
                style={{ color: COLORS[index] }}
              >
                {scope.value.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {((scope.value / totalEmissions) * 100).toFixed(1)}% of total
              </p>
            </div>
          ))}
        </div>

        {scopeData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scopeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {scopeData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toFixed(2)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No scope data available to display
          </div>
        )}

        <div className="mt-2 space-y-4">
          <div>
            <h4 className="font-bold text-xl mb-4">Emissions Breakdown</h4>
            <div className="space-y-4 text-base">
              {scopeData.map((scope, index) => (
                <div
                  key={scope.name}
                  className="flex hover:bg-gray-50 rounded-lg p-2"
                >
                  <span className="font-semibold text-gray-800 text-lg">
                    {scope.name}:
                  </span>
                  <span
                    className="font-semibold text-lg ml-2"
                    style={{ color: COLORS[index] }}
                  >
                    {scope.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeModal;
