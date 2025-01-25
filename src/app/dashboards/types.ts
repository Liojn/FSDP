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

//Top ranking of machinery consumed
export interface EquipmentTopData{
  name: string;
  consumption: number;
}

//Interface for CropCycle Analysis
type Crop = {
  type: string;
};
export interface CropCalendarData{
  month: string;
  phase: string;
  burnRisk: 'High' | 'Medium' | 'Low';
  temperature: number;
  crops: Crop[];
};

export interface MetricsUpdateParams {
  data: MetricsDataResponse | null;
  emissionsData: EmissionsDataResponse | null;
  previousEmissionsData: MetricsDataResponse | null;
  targetGoalData: TargetGoalResponse;
  emissionCategoryData: EmissionCategoryData[];
  topEquipmentData: EquipmentTopData[];
  cropCycleData: CropCalendarData[];
}
