export interface ScopeThreshold {
  id: string;
  scope: "Scope 1" | "Scope 2" | "Scope 3";
  description: string;
  value: number;
  unit: string;
}

export interface MetricData {
  title: string;
  value: string | number;
  unit: string;
}

export interface EmissionCategoryData {
  category: string;
  value: number;
}

export interface TargetGoalResponse {
  target: number;
  isEarliestYear: boolean;
  firstYearGoal: number;
}

export interface MetricsDataResponse {
  "energyAverage in kWh": number;
  "carbonAverage in CO2E": number;
  "netAverage in CO2E": number;
}

export interface EmissionsDataResponse {
  monthlyEmissions: number[];
  averageAbsorb: number;
}

export interface MetricsUpdateParams {
  data: MetricsDataResponse | null;
  emissionsData: EmissionsDataResponse | null;
  previousEmissionsData: MetricsDataResponse | null;
  targetGoalData: TargetGoalResponse;
  emissionCategoryData: EmissionCategoryData[];
}

// Emission Data Interfaces
export interface Equipment {
  fuelEmissions: number;
  electricityEmissions: number;
}

export interface Livestock {
  emissions: number;
}

export interface Waste {
  emissions: number;
}


export interface Crop {
  totalEmissions: number;
}

export interface ThresholdEmissionData {
  equipment: Equipment[];
  livestock: Livestock[];
  waste: Waste[];
  crops: Crop[];
}



export interface EmissionsData {
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
