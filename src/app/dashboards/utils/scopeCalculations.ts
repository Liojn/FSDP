// utils/scopeCalculations.ts
import { EmissionsData } from "@/app/dashboards/types";  // Update this import to use the dashboard types

export const calculateScope1 = (data: EmissionsData): number => {
  const fuelEmissions = data.equipment.reduce(
    (sum: number, eq) => sum + (eq.fuelEmissions || 0),
    0
  );
  
  const livestockEmissions = data.livestock.reduce(
    (sum: number, item) => sum + (item.emissions || 0),
    0
  );
  
  return fuelEmissions + livestockEmissions;
};

export const calculateScope2 = (data: EmissionsData): number => {
  return data.equipment.reduce(
    (sum: number, eq) => sum + (eq.electricityEmissions || 0),
    0
  );
};

export const calculateScope3 = (data: EmissionsData): number => {
  const wasteEmissions = data.waste.reduce(
    (sum: number, item) => sum + (item.emissions || 0),
    0
  );
  
  const cropEmissions = data.crops.reduce(
    (sum: number, item) => sum + (item.totalEmissions || 0),
    0
  );
  
  return wasteEmissions + cropEmissions;
};