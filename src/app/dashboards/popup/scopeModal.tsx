import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';

interface ScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month?: number;
  userId: string;
}

interface EmissionsData {
  equipment: Array<{
    fuelEmissions: number;
    electricityEmissions: number;
  }>;
  livestock: Array<{
    emissions: number;
  }>;
  waste: Array<{
    emissions: number;
  }>;
  crops: Array<{
    totalEmissions: number;
  }>;
}

const ScopeModal = ({ isOpen, onClose, year, month, userId }: ScopeModalProps) => {
  const [data, setData] = useState<EmissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `/api/dashboards/popup/${userId}?year=${year}${month ? `&month=${month}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch data');
        const json = await response.json();
        if (json.success) {
          setData(json.data);
        } else {
          throw new Error('Invalid data received');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, userId, year, month]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex items-center space-x-2">
          <Loader2 className="animate-spin" />
          <span>Loading emissions data...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="mt-2">{error || 'Failed to load emissions data'}</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const calculateScope1 = () => {
    const fuelEmissions = data.equipment.reduce((sum, eq) => sum + eq.fuelEmissions, 0);
    const livestockEmissions = data.livestock.reduce((sum, item) => sum + item.emissions, 0);
    return fuelEmissions + livestockEmissions;
  };

  const calculateScope2 = () => {
    return data.equipment.reduce((sum, eq) => sum + eq.electricityEmissions, 0);
  };

  const calculateScope3 = () => {
    const wasteEmissions = data.waste.reduce((sum, item) => sum + item.emissions, 0);
    const cropEmissions = data.crops.reduce((sum, item) => sum + item.totalEmissions, 0);
    return wasteEmissions + cropEmissions;
  };

  const scope1Value = calculateScope1();
  const scope2Value = calculateScope2();
  const scope3Value = calculateScope3();
  const totalEmissions = scope1Value + scope2Value + scope3Value;

  const scopeData = [
    { 
      name: 'Scope 1', 
      value: scope1Value,
      description: 'Direct emissions from fuel consumption and livestock'
    },
    { 
      name: 'Scope 2', 
      value: scope2Value,
      description: 'Indirect emissions from purchased electricity'
    },
    { 
      name: 'Scope 3', 
      value: scope3Value,
      description: 'Other indirect emissions from waste and crop management'
    }
  ];

  const COLORS = ['#4ade80', '#60a5fa', '#f472b6'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold">
            Carbon Emissions Breakdown {year}{month ? `/${month}` : ''}
          </h2>
          <p className="text-gray-600 mt-1">
            Total emissions: {totalEmissions.toFixed(2)} KG CO2e
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {scopeData.map((scope, index) => (
            <div 
              key={scope.name} 
              className="p-4 border rounded-lg shadow-sm"
            >
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

        <div className="mt-6 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Emissions Breakdown</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {scopeData.map((scope) => (
                <div key={scope.name} className="flex justify-between items-center">
                  <span className="font-medium">{scope.name}:</span>
                  <span>{scope.description}</span>
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