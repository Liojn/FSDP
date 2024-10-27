
//Controller for getting the available Years
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