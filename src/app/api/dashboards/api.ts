
//Client side functions for calling fetch, to store them here


//for getting the available Years
export const fetchUniqueYears = async (companyId: string): Promise<number[]> => {
    try {
      const response = await fetch(`api/dashboards/trackyear/${companyId}`, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch unique years');
      }
  
      const data = await response.json();
      return data; // Assume the response is an array of numbers
    } catch (error) {
      console.error('Error fetching unique years:', error);
      return []; // Return an empty array on error
    }
};

export type EmissionData = {
    "energyAverage in kWh": number;
    "carbonAverage in CO2E": number;
    "netAverage in CO2E": number;
} | null;

//for getting the data to display on the 3 cards dashboard
export const getMetricsData = async (companyId: string, year: number): Promise<EmissionData> => {
   try {
        const response = await fetch(`/api/dashboards/cards/${companyId}?year=${year}`);
        
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        
        const data: EmissionData = await response.json();
        console.log("Emission Data:", data);
        return data;
    } catch (error) {
        console.error("Failed to fetch emission data:", error);
        return null;
    }
}