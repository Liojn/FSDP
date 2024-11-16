/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

interface ModalProps {
  isVisible: boolean;
  category: string | null;
  userId: string;
  month?: string | number;
  year: number;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({
  isVisible,
  category,
  userId,
  month,
  year,
  onClose,
}) => {
  const [details, setDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  useEffect(() => {
    if (!isVisible || !category) return;

    // Convert `month` to a number if it is a string, or set it to `null` if `month` is undefined
    const parsedMonth: number | null =
      typeof month === 'string'
        ? parseInt(month, 10)
        : typeof month === 'number'
        ? month
        : null;

    // Check if `parsedMonth` is a valid number, or set to null if it's NaN
    if (typeof parsedMonth === 'number' && !isNaN(parsedMonth)) {
      setSelectedMonth(parsedMonth);
    } else {
      setSelectedMonth(null);
      console.error("Invalid month value:", month);
    }
  }, [isVisible, category, month]);

  // Separate useEffect for API call
  useEffect(() => {
    if (!isVisible || !category || selectedMonth === null) return;

    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = selectedMonth !== null
          ? `/api/dashboards/popup/${userId}?year=${year}&month=${selectedMonth}`
          : `/api/dashboards/popup/${userId}?year=${year}`;

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        let entries;
        switch (category.toLowerCase()) {
          case "fuel":
            entries = data.data.equipment
              .filter((entry: any) => entry.fuelType && entry.fuelConsumed)
              .sort(
                (a: any, b: any) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );
            break;
          case "electricity":
            entries = data.data.equipment
              .filter((entry: any) => entry.electricityUsed)
              .sort(
                (a: any, b: any) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );
            break;
          case "livestock":
            entries = data.data.livestock.sort(
              (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            break;
          case "crops":
            entries = data.data.crops.sort(
              (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            break;
          case "waste":
            entries = data.data.waste.sort(
              (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            break;
          default:
            entries = [];
        }

        setDetails(entries);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (typeof value === "number") {
      switch (key) {
        case "emissions":
        case "electricityEmissions":
        case "totalEmissions":
        case "fuelEmissions":
        case "soilEmissions":
        case "fertilizerEmission":
          return `${formatValue(value)} kg CO₂`;
        case "fuelConsumed":
          return `${formatValue(value)} liters`;
        case "electricityUsed":
          return `${formatValue(value)} kWh`;
        case "fertilizerUsed":
          return `${formatValue(value)} kg`;
        case "areaPlanted":
          return `${formatValue(value)} hectares`;
        default:
          return `${formatValue(value)}`;
      }
    }
    return value;
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
              <li>
                <strong>Date:</strong> {new Date(detail.date).toLocaleString()}
              </li>
              {/* Render category-specific details */}
              {category?.toLowerCase() === "fuel" && (
                <>
                  <li>
                    <strong>Fuel Type:</strong> {detail.fuelType}
                  </li>
                  <li>
                    <strong>Fuel Consumed:</strong>{" "}
                    {formatWithUnits("fuelConsumed", detail.fuelConsumed)}
                  </li>
                  <li>
                    <strong>Fuel Emissions:</strong>{" "}
                    {formatWithUnits("fuelEmissions", detail.fuelEmissions)}
                  </li>
                </>
              )}
              {category?.toLowerCase() === "electricity" && (
                <>
                  <li>
                    <strong>Electricity Used:</strong>{" "}
                    {formatWithUnits("electricityUsed", detail.electricityUsed)}
                  </li>
                  <li>
                    <strong>Electricity Emissions:</strong>{" "}
                    {formatWithUnits(
                      "electricityEmissions",
                      detail.electricityEmissions
                    )}
                  </li>
                </>
              )}
              {category?.toLowerCase() === "livestock" && (
                <>
                  <li>
                    <strong>Species:</strong> {detail.species}
                  </li>
                  <li>
                    <strong>Count:</strong> {detail.count}
                  </li>
                  <li>
                    <strong>Emissions:</strong>{" "}
                    {formatWithUnits("emissions", detail.emissions)}
                  </li>
                </>
              )}
              {category?.toLowerCase() === "crops" && (
                <>
                  <li>
                    <strong>Crop Type:</strong> {detail.cropType}
                  </li>
                  <li>
                    <strong>Area Planted:</strong>{" "}
                    {formatWithUnits("areaPlanted", detail.areaPlanted)}
                  </li>
                  <li>
                    <strong>Fertilizer Used:</strong>{" "}
                    {formatWithUnits("fertilizerUsed", detail.fertilizerUsed)}
                  </li>
                  <li>
                    <strong>Fertilizer Emissions:</strong>{" "}
                    {formatWithUnits(
                      "fertilizerEmissions",
                      detail.fertilizerEmissions
                    )}
                  </li>
                  <li>
                    <strong>Soil Emissions:</strong>{" "}
                    {formatWithUnits("soilEmissions", detail.soilEmissions)}
                  </li>
                  <li>
                    <strong>Total Emissions:</strong>{" "}
                    {formatWithUnits("totalEmissions", detail.totalEmissions)}
                  </li>
                </>
              )}
              {category?.toLowerCase() === "waste" && (
                <>
                  <li>
                    <strong>Waste Type:</strong> {detail.wasteType}
                  </li>
                  <li>
                    <strong>Quantity:</strong>{" "}
                    {formatWithUnits("quantity", detail.quantity)}
                  </li>
                  <li>
                    <strong>Emissions:</strong>{" "}
                    {formatWithUnits("emissions", detail.emissions)}
                  </li>
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

