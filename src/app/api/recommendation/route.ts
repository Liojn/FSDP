import { NextResponse } from "next/server";
import { CategoryType, Recommendation, RecommendationRequest } from "@/types";
import Anthropic from "@anthropic-ai/sdk";

// Initialize the Claude client with the provided API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY // Use environment variable
});

// Define the structure of a recommendation returned from the API
interface ApiRecommendation {
  title: string;                       
  description: string;                 
  impact: string;                      
  steps: string[];                     
  savings: number;                     
  priority?: number;                   
  difficulty?: 'easy' | 'medium' | 'hard'; 
  roi?: number;                        
  implementationTimeline?: string;     
  sourceData?: string;                 
  dashboardLink?: string;              
  scope?: "Scope 1" | "Scope 2" | "Scope 3";
}

interface ApiResponse {
  recommendations: ApiRecommendation[]; 
}

interface Metrics {
  energy: {
    consumption: number;          // Energy consumption in kWh
    previousYearComparison: number; // Comparison percentage with the previous year
  };
  emissions: {
    total: number;                // Total emissions in tons CO2e
    byCategory: Record<string, number>;
  };
  waste: {
    quantity: number;             // Quantity of waste in tons
    byType: Record<string, number>;
  };
  crops: {
    area: number;                 // Area of crops in hectares
    fertilizer: number;           // Amount of fertilizer used in tons
  };
  livestock: {
    count: number;                // Count of livestock
    emissions: number;            // Emissions from livestock in tons CO2e
  };
}

const cleanAndParseJSON = (str: string): ApiResponse => {
  try {
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}') + 1;
    if (start === -1 || end === 0) throw new Error("No JSON object found");
    const jsonStr = str.slice(start, end);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw error;
  }
};

// Function to map categories to emission scopes
function mapCategoryToScope(category: CategoryType): "Scope 1" | "Scope 2" | "Scope 3" | null {
  switch (category) {
    case CategoryType.EQUIPMENT:
      return "Scope 1"; // Direct emissions from owned equipment
    case CategoryType.LIVESTOCK:
      return "Scope 1"; // Direct emissions from livestock
    case CategoryType.CROPS:
      return "Scope 3"; // Indirect emissions from agricultural activities
    case CategoryType.WASTE:
      return "Scope 3"; // Indirect emissions from waste management
    case CategoryType.OVERALL:
      return null; // Will generate recommendations for all scopes
    default:
      return null;
  }
}

// Function to calculate scope-based emissions
function calculateScopeEmissions(metrics: Metrics) {
  const scope1 = metrics.livestock.emissions + 
                (metrics.emissions.byCategory["equipment"] || 0);

  const scope2 = metrics.energy.consumption * 0.0005; // Convert kWh to CO2e tons (approximate)

  const scope3 = metrics.emissions.total - (scope1 + scope2);

  return {
    scope1,
    scope2,
    scope3: Math.max(0, scope3),
  };
}

// Function to check if any thresholds are exceeded
async function getExceededThresholds(metrics: Metrics) {
  try {
    const response = await fetch("http://localhost:3000/api/thresholds");
    const data = await response.json();
    const thresholds = data.thresholds;
    const scopeEmissions = calculateScopeEmissions(metrics);
    const exceededThresholds = [];

    for (const threshold of thresholds) {
      let currentValue = 0;
      switch (threshold.scope) {
        case "Scope 1":
          currentValue = scopeEmissions.scope1;
          break;
        case "Scope 2":
          currentValue = scopeEmissions.scope2;
          break;
        case "Scope 3":
          currentValue = scopeEmissions.scope3;
          break;
      }

      if (currentValue > threshold.value) {
        exceededThresholds.push({
          scope: threshold.scope,
          currentValue,
          thresholdValue: threshold.value,
          unit: threshold.unit,
        });
      }
    }

    return exceededThresholds;
  } catch {
    return []; // Return empty array if thresholds can't be fetched
  }
}

// Function to generate a prompt for the AI based on the category and metrics
const generatePrompt = async (category: CategoryType, metrics: Metrics, timeframe: string) => {
  const exceededThresholds = await getExceededThresholds(metrics);
  const scopeEmissions = calculateScopeEmissions(metrics);
  const targetScope = mapCategoryToScope(category);
  
  const systemContext = `You are a JSON-only response system specialized in farm management recommendations focused on reducing emissions across different scopes. Only output valid JSON objects with no additional text.`;
  
  const scopeContext = targetScope 
    ? `Focus on ${targetScope} emissions reduction strategies.` 
    : "Consider recommendations across all emission scopes.";

  let thresholdContext = "";
  if (exceededThresholds.length > 0) {
    thresholdContext = `\nThe following thresholds have been exceeded:
${exceededThresholds.map(t => `- ${t.scope}: Current ${t.currentValue} ${t.unit} exceeds threshold of ${t.thresholdValue} ${t.unit}`).join('\n')}

Prioritize recommendations that will help bring these metrics back within their thresholds within the ${timeframe} timeframe.`;
  }

  const prompt = `${systemContext}

${scopeContext}

Current emissions by scope:
- Scope 1 (Direct): ${scopeEmissions.scope1.toFixed(2)} tons CO2e
- Scope 2 (Energy): ${scopeEmissions.scope2.toFixed(2)} tons CO2e
- Scope 3 (Indirect): ${scopeEmissions.scope3.toFixed(2)} tons CO2e

Additional metrics for context:
Energy: ${metrics.energy.consumption}kWh (${metrics.energy.previousYearComparison}% vs last year)
Waste: ${metrics.waste.quantity} tons
Crops: ${metrics.crops.area} hectares, ${metrics.crops.fertilizer} tons fertilizer
Livestock: ${metrics.livestock.count} animals, ${metrics.livestock.emissions} tons CO2e emissions
${thresholdContext}

Return ONLY a JSON object in this exact format with no additional text:
{
  "recommendations": [
    {
      "title": "Clear action-oriented title",
      "description": "Clear 1-2 sentence description",
      "impact": "Specific metrics and numbers",
      "steps": ["step1", "step2", "step3"],
      "savings": 1000,
      "priority": 1-5 number,
      "difficulty": "easy|medium|hard",
      "roi": percentage number,
      "implementationTimeline": "timeframe string",
      "sourceData": "reference to metrics used",
      "dashboardLink": "/dashboards/category-specific-path",
      "scope": "Scope 1|Scope 2|Scope 3"
    }
  ]
}`;

  return prompt;
};

// Handler function for the POST request
export async function POST(req: Request) {
  try {
    const { category, metrics, timeframe } = await req.json() as RecommendationRequest;
    
    if (!category || !metrics || !timeframe) {
      return NextResponse.json(
        { error: "Category, metrics, and timeframe are required" },
        { status: 400 }
      );
    }

    const prompt = await generatePrompt(category, metrics, timeframe);

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    // Check for valid response and get the text content
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || typeof textContent.text !== 'string') {
      throw new Error("No valid text response from Claude");
    }

    // Parse and validate response
    const parsedResponse = cleanAndParseJSON(textContent.text);
    
    // Transform recommendations
    const recommendations: Recommendation[] = parsedResponse.recommendations.map((rec) => ({
      title: rec.title,
      description: rec.description,
      impact: rec.impact,
      steps: rec.steps,
      savings: typeof rec.savings === 'number' ? rec.savings : 0,
      category,
      implemented: false,
      priority: rec.priority,
      difficulty: rec.difficulty,
      roi: rec.roi,
      implementationTimeline: rec.implementationTimeline,
      sourceData: rec.sourceData,
      dashboardLink: rec.dashboardLink,
      scope: rec.scope
    }));

    return NextResponse.json({ recommendations }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
