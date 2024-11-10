// components/Modal.tsx
import React, { useEffect, useState } from 'react';

interface ModalProps {
  isVisible: boolean;
  category: string | null;
  userId: string;
  month?: number;
  year: number;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isVisible, category, userId, month, year, onClose }) => {
  const [details, setDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);;

  useEffect(() => {
    if (!isVisible || !category) return;

    if (month !== undefined && month !== selectedMonth) { //update month only when it is provided
      setSelectedMonth(month);
    }

    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Default API endpoint is based on year only if selectedMonth is null
        const endpoint = selectedMonth
          ? `/api/dashboards/popup/${userId}?year=${year}&month=${selectedMonth}`
          : `/api/dashboards/popup/${userId}?year=${year}`;

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        
        // Split equipment into fuel and electricity categories and sort by date
        let entries;
        if (category.toLowerCase() === 'fuel') {
          entries = data.data.equipment
            .filter((entry: any) => entry.fuelType && entry.fuelConsumed)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort from latest to earliest
        } else if (category.toLowerCase() === 'electricity') {
          entries = data.data.equipment
            .filter((entry: any) => entry.electricityUsed)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort from latest to earliest
        } else {
          entries = (data.data[category.toLowerCase()] || [])
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort from latest to earliest
        }

        setDetails(entries);
      } catch (error) {
        setError("Error fetching data for the selected category.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [isVisible, category, userId, selectedMonth, year]);

  if (!isVisible) return null;

  const formatValue = (value: number) => {
    return value % 1 !== 0 ? value.toFixed(1) : value;
  };

  const formatWithUnits = (key: string, value: number | string) => {
    if (typeof value === 'number') {
      switch (key) {
        case 'emissions':
          return `${formatValue(value)} kg CO₂`;
        case 'electricityEmissions':
          return `${formatValue(value)} kg CO₂`;
        case 'totalEmissions':
          return `${formatValue(value)} kg CO₂`;
        case 'fuelEmissions':
          return `${formatValue(value)} kg CO₂`;
        case 'soilEmissions':
          return `${formatValue(value)} kg CO₂`;
        case 'fuelConsumed':
          return `${formatValue(value)} liters`;
        case 'electricityUsed':
          return `${formatValue(value)} kWh`;
        case 'fertilizerUsed':
          return `${formatValue(value)} kg`;
        case 'areaPlanted':
          return `${formatValue(value)} hectares`;
        default:
          return `${formatValue(value)}`;
      }
    }
    return value;
  };

  const formatKey = (key: string) => {
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^[a-z]/, (char) => char.toUpperCase());
  };

  const renderDetails = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!details.length) return <p>No details available.</p>;

    return (
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded shadow">
            <ul className="space-y-1">
              <li><strong>Date:</strong> {new Date(detail.date).toLocaleString()}</li>
              {category?.toLowerCase() === 'fuel' && (
                <>
                  <li><strong>Fuel Type:</strong> {detail.fuelType}</li>
                  <li><strong>Fuel Consumed:</strong> {formatWithUnits('fuelConsumed', detail.fuelConsumed)}</li>
                  <li><strong>Fuel Emissions:</strong> {formatWithUnits('fuelEmissions', detail.fuelEmissions)}</li>
                </>
              )}
              {category?.toLowerCase() === 'electricity' && (
                <>
                  <li><strong>Electricity Used:</strong> {formatWithUnits('electricityUsed', detail.electricityUsed)}</li>
                  <li><strong>Electricity Emissions:</strong> {formatWithUnits('electricityEmissions', detail.electricityEmissions)}</li>
                </>
              )}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full max-h-[50vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{category} Emission Details</h2>
        {renderDetails()}
        <button
          className="mt-4 bg-lime-700 text-white px-4 py-2 rounded hover:bg-lime-500"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
