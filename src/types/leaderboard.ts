// types/leaderboard.ts

export type TimeFilterType = "Today" | "Yesterday" | "Last 7 Days" | "Last Month";
export type DataFilterType = "Carbon Emissions" | "Energy Consumption";

export interface LeaderboardData {
  name: string;
  carbonScore: number;
  energyScore: number;
  totalEmissions: number;
  totalEnergy: number;
}

export interface LeaderboardResponse {
  status: "success" | "error";
  data?: LeaderboardData[];
  message?: string;
}

export interface DatabaseCollections {
  Equipment: Array<{
    company_id: string;
    fuel_type: string;
    fuel_consumed_l: number;
    total_electricity_used_kWh: number;
    date: Date;
  }>;
  Livestock: Array<{
    company_id: string;
    species: string;
    number_of_species: number;
    date: Date;
  }>;
  Crops: Array<{
    company_id: string;
    fertilizer_amt_used_kg: number;
    area_planted_ha: number;
    date: Date;
  }>;
  Waste: Array<{
    company_id: string;
    waste_type: string;
    waste_quantity_kg: number;
    date: Date;
  }>;
}