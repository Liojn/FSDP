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

export interface DashboardData {
  loading: boolean;
  yearFilter: string;
  yearOptions: number[];
  selectedYear: number | null;
  selectedMonth: number | string;
  userId: string | null;
  monthlyEmissions: number[];
  averageAbsorbed: number | null;
  currentYearEmissions: number | null;
  previousYearEmissions: number | null;
  targetGoal: number;
  isEarliestYear: boolean;
  firstYearGoal: number;
  categoryEmissionsData: EmissionCategoryData[] | null;
  metricsData: MetricData[];
  exceedingScopes: string[];
  handleYearFilterChange: (value: string) => void;
  handleMonthClick: (month: string | number) => void;
}
