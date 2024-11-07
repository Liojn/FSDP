
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
        const response = await fetch(`/api/dashboards/cards/${companyId}?year=${year}`, {
          method: 'GET',
        });
        
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

//Define interface for API Response to CarbonMonthly Emission
export interface MonthlyCarbonEmissionResponse {
    monthlyEmissions: number[];
    averageAbsorb: number;
}

//Fetch function to get monthly carbon emissions from the API
export const fetchMonthlyCarbonEmissions = async(companyId: string, year: number): Promise<MonthlyCarbonEmissionResponse | null> => {
    try {
        const response = await fetch(`/api/dashboards/monthlyEmission/${companyId}?year=${year}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MonthlyCarbonEmissionResponse = await response.json();
        return data; //Return the data received from the API
    } catch (error) {
        console.error("Failed to fetch monthly carbon emissions:", error);
        return null; // Return null on error or handle as needed
    }
}

//Function to get Users goal target set according to the year
export const fetchEmissionTarget = async (companyId: string, year: number) => {
  try {
    //Fetch data from the API
    const response = await fetch(`/api/dashboards/checkGoal/${companyId}?year=${year}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    //Parse the response JSON
    const data = await response.json();

    //Check if the target was returned
    if (data.target !== undefined) {
      return data.target;
    } else {
      throw new Error("Target data not found.");
    }
  } catch (error) {
    console.error("Error fetching emission target:", error);
    return null; // You can return a default value if needed
  }
};
