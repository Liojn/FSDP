export const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  "Scope 1": "Direct emissions from owned or controlled sources",
  "Scope 2": "Indirect emissions from purchased electricity, steam, heating, and cooling",
  "Scope 3": "All other indirect emissions in the value chain",
};

/*
export const METRIC_TO_SCOPE: { [key: string]: "Scope 1" | "Scope 2" | "Scope 3" } = {
  "Total Energy Consumption": "Scope 1",
  "Total Net Carbon Emissions": "Scope 2",
  "Total Carbon Neutral Emissions": "Scope 3",
};
*/

export const DEFAULT_METRICS = [
  { title: "Total Energy Consumption", value: "Loading...", unit: "kWh" },
  { title: "Total Net Carbon Emissions", value: "Loading...", unit: "KG CO₂" },
  { title: "Total Carbon Neutral Emissions", value: "Loading...", unit: "KG CO₂" },
];
