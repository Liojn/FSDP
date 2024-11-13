import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  fetchUniqueYears, 
  getMetricsData, 
  fetchMonthlyCarbonEmissions,
  fetchEmissionCategory,
  fetchEmissionTarget
} from '../app/api/dashboards/api';

// Type definitions
interface EmissionData {
  "energyAverage in kWh"?: number;
  "carbonAverage in CO2E"?: number;
  "netAverage in CO2E"?: number;
}

interface MonthlyCarbonEmissionResponse {
  monthlyEmissions: number[];
  averageAbsorb: number;
}

interface EmissionCategoryData {
  category: string;
  value: number;
}

interface MonthlyData {
  equipment: number[];
  livestock: number[];
  crops: number[];
  waste: number[];
  totalMonthlyEmissions: number[];
  totalMonthlyAbsorption: number[];
  netMonthlyEmissions: number[];
  emissionTargets: { [key: number]: number };
}

interface PredictionData {
  monthlyData: MonthlyData;
}

interface EmissionTarget {
  target: number;
  isEarliestYear: boolean;
}

type InsightData = EmissionData | MonthlyCarbonEmissionResponse | EmissionCategoryData | PredictionData;

// Helper Functions
const safeNumberFormat = (value: number | undefined, decimals: number = 2): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'N/A';
  }
  return value.toFixed(decimals);
};

const safeArraySum = (arr: number[] | undefined): number => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0;
  }
  return arr.reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);
};

// PDF Generation Functions
const generatePdfPage = async (element: HTMLElement, pdf: jsPDF, isFirstPage: boolean = true) => {
  try {
    const canvas = await html2canvas(element, { 
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth - 40; // 20px margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add new page if not first page
    if (!isFirstPage) {
      pdf.addPage();
    }
    
    // If content is longer than page, split it across multiple pages
    let heightLeft = imgHeight;
    let position = 20; // Start 20px from top
    
    // First page
    pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    return true;
  } catch (error) {
    console.error("Error generating PDF page:", error);
    return false;
  }
};

const generatePdf = async (elements: HTMLElement[]): Promise<boolean> => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4"
    });
    
    for (let i = 0; i < elements.length; i++) {
      // Add slight delay between pages to prevent rendering issues
      await new Promise(resolve => setTimeout(resolve, 200));
      const success = await generatePdfPage(elements[i], pdf, i === 0);
      if (!success) {
        throw new Error(`Failed to generate page ${i + 1}`);
      }
    }
    
    pdf.save("sustainability_report.pdf");
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};

// Fetch prediction data with error handling
const fetchPredictionData = async (userName: string): Promise<PredictionData | null> => {
  try {
    const endYear = new Date().getFullYear();
    const startYear = endYear - 4;
    
    const promises = Array.from({ length: 5 }, (_, i) => {
      return fetch("/api/prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userName: userName,
        },
        body: JSON.stringify({
          endYear: startYear + i,
          dataType: "carbon-emissions",
        }),
      })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .catch((error) => {
        console.error(`Error fetching prediction data for year ${startYear + i}:`, error);
        return null;
      });
    });

    const results = await Promise.all(promises);
    
    if (results.every(result => result === null)) {
      return null;
    }

    const combinedData: PredictionData = {
      monthlyData: {
        equipment: [],
        livestock: [],
        crops: [],
        waste: [],
        totalMonthlyEmissions: [],
        totalMonthlyAbsorption: [],
        netMonthlyEmissions: [],
        emissionTargets: {},
      },
    };

    results.forEach((result) => {
      if (!result?.monthlyData) return;
      
      Object.keys(result.monthlyData).forEach((key) => {
        if (key === "emissionTargets") {
          combinedData.monthlyData.emissionTargets = {
            ...combinedData.monthlyData.emissionTargets,
            ...result.monthlyData.emissionTargets,
          };
        } else {
          const arrayKey = key as keyof Omit<MonthlyData, 'emissionTargets'>;
          combinedData.monthlyData[arrayKey] = [
            ...combinedData.monthlyData[arrayKey],
            ...(result.monthlyData[arrayKey] || []),
          ];
        }
      });
    });

    return combinedData;
  } catch (error) {
    console.error("Error in fetchPredictionData:", error);
    return null;
  }
};

// AI insight generation
const generateAIInsight = (data: InsightData | null | undefined, type: string): string => {
  if (!data) return 'No data available for analysis.';

  try {
    switch(type) {
      case 'metrics': {
        const metricsData = data as EmissionData;
        return `Based on current data, your total energy consumption is ${safeNumberFormat(metricsData["energyAverage in kWh"], 0)} kWh, 
                with net carbon emissions of ${safeNumberFormat(metricsData["carbonAverage in CO2E"], 0)} KG CO2. Your carbon neutral emissions 
                stand at ${safeNumberFormat(metricsData["netAverage in CO2E"], 0)} KG CO2.`;
      }
      
      case 'emissions': {
        const emissionsData = data as MonthlyCarbonEmissionResponse;
        if (!Array.isArray(emissionsData.monthlyEmissions) || emissionsData.monthlyEmissions.length < 2) {
          return 'Insufficient emissions data for trend analysis.';
        }
        const trend = emissionsData.monthlyEmissions[11] > emissionsData.monthlyEmissions[10] ? 'increasing' : 'decreasing';
        return `Monthly carbon emissions show a ${trend} trend in recent months. 
                The average absorption rate is ${safeNumberFormat(emissionsData.averageAbsorb)} KG CO2.`;
      }
      
      case 'categories': {
        const categoryData = data as EmissionCategoryData;
        return `${categoryData.category || 'Unknown Category'}: ${safeNumberFormat(categoryData.value)} KG CO2`;
      }
      
      case 'prediction': {
        const predictionData = data as PredictionData;
        if (!predictionData.monthlyData?.netMonthlyEmissions) {
          return 'Insufficient prediction data available.';
        }
        
        const latestNetEmissions = predictionData.monthlyData.netMonthlyEmissions.slice(-12);
        if (latestNetEmissions.length === 0) {
          return 'No recent emissions data available for prediction analysis.';
        }
        
        const yearlyTotal = safeArraySum(latestNetEmissions);
        const monthlyAverage = yearlyTotal / Math.max(latestNetEmissions.length, 1);
        const isDecreasing = latestNetEmissions[latestNetEmissions.length - 1] < latestNetEmissions[0];
        
        return `Based on the last ${latestNetEmissions.length} months of data, your average monthly net emissions are ${safeNumberFormat(monthlyAverage)} KG CO2. 
                The trend is ${isDecreasing ? 'decreasing' : 'increasing'}, indicating ${isDecreasing ? 'progress' : 'challenges'} 
                in reaching your emission reduction goals.`;
      }
      
      default:
        return 'No specific insights available.';
    }
  } catch (error) {
    console.error(`Error generating insight for type ${type}:`, error);
    return 'Error generating insights. Please check your data.';
  }
};

// Create report sections
const createReportSection = (title: string, content: string): HTMLElement => {
  const section = document.createElement('div');
  section.className = 'report-section';
  section.style.marginBottom = '20px';
  section.innerHTML = `
    <h2 style="color: #2c3e50; margin-bottom: 10px;">${title}</h2>
    <div style="line-height: 1.6;">${content}</div>
  `;
  return section;
};

// Main report generation function
export const generateSustainabilityReport = async (): Promise<void> => {
  try {
    // Validate user information
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    if (!userId || !userName) {
      throw new Error("User information not found");
    }

    // Create main container
    const reportContainer = document.createElement('div');
    reportContainer.style.cssText = `
      font-family: Arial, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
    `;

    // Add report header
    const header = document.createElement('div');
    header.innerHTML = `
      <h1 style="color: #1a365d; text-align: center; margin-bottom: 30px;">
        Sustainability Report
        <div style="font-size: 14px; color: #666; margin-top: 10px;">
          Generated on ${new Date().toLocaleDateString()}
        </div>
      </h1>
    `;
    reportContainer.appendChild(header);

    // Fetch all required data concurrently
    try {
      const years = await fetchUniqueYears(userId);
      const currentYear = years?.[years.length - 1];
      
      if (!currentYear) {
        throw new Error("No year data available");
      }

      const [metricsData, emissionsData, categoryData, targetData, predictionData] = await Promise.all([
        getMetricsData(userId, currentYear).catch(() => null),
        fetchMonthlyCarbonEmissions(userId, currentYear).catch(() => null),
        fetchEmissionCategory(userId, currentYear, "").catch(() => null),
        fetchEmissionTarget(userId, currentYear).catch(() => null),
        fetchPredictionData(userName).catch(() => null)
      ]);

      // Add report sections
      if (metricsData) {
        reportContainer.appendChild(createReportSection(
          "Metrics Summary",
          generateAIInsight(metricsData, 'metrics')
        ));
      }

      if (targetData) {
        reportContainer.appendChild(createReportSection(
          "Target Progress",
          `Current Year Target: ${safeNumberFormat(targetData.target)} KG CO2
           ${targetData.isEarliestYear ? '(First Year Goal)' : ''}`
        ));
      }

      if (emissionsData) {
        reportContainer.appendChild(createReportSection(
          "Emissions Analysis",
          generateAIInsight(emissionsData, 'emissions')
        ));
      }

      if (categoryData) {
        reportContainer.appendChild(createReportSection(
          "Emissions by Category",
          generateAIInsight(categoryData, 'categories')
        ));
      }

      if (predictionData?.monthlyData) {
        const predictionContent = `
          ${generateAIInsight(predictionData, 'prediction')}
          
          <h3>Emission Sources Breakdown (Last 12 Months)</h3>
          <ul style="list-style-type: none; padding: 0;">
            <li>Equipment: ${safeNumberFormat(safeArraySum(predictionData.monthlyData.equipment.slice(-12)))} KG CO2</li>
            <li>Livestock: ${safeNumberFormat(safeArraySum(predictionData.monthlyData.livestock.slice(-12)))} KG CO2</li>
            <li>Crops: ${safeNumberFormat(safeArraySum(predictionData.monthlyData.crops.slice(-12)))} KG CO2</li>
            <li>Waste: ${safeNumberFormat(safeArraySum(predictionData.monthlyData.waste.slice(-12)))} KG CO2</li>
          </ul>
        `;
        reportContainer.appendChild(createReportSection(
          "Predictions and Net Zero Progress",
          predictionContent
        ));
      }

      if (emissionsData?.monthlyEmissions) {
        const monthlyContent = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
            ${emissionsData.monthlyEmissions.map((emission, index) => `
              <div style="background: #f8fafc; padding: 10px; border-radius: 4px;">
                Month ${index + 1}: ${safeNumberFormat(emission)} KG CO2
              </div>
            `).join('')}
          </div>
        `;
        reportContainer.appendChild(createReportSection(
          "Monthly Emissions Trends",
          monthlyContent
        ));
      }

    } catch (error) {
      console.error("Error fetching report data:", error);
      reportContainer.appendChild(createReportSection(
        "Error",
        "Failed to fetch report data. Please try again later."
      ));
    }

    // Generate PDF
    document.body.appendChild(reportContainer);
    const success = await generatePdf([reportContainer]);
    document.body.removeChild(reportContainer);

    if (!success) {
      throw new Error("Failed to generate PDF");
    }

  } catch (error) {
    console.error("Error generating sustainability report:", error);
    throw new Error("Failed to generate sustainability report. Please Try again later.");
  }
}