import { NextResponse } from "next/server";
import { Recommendation, MetricData, CategoryType } from "@/types";
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

// Function to calculate scope-based emissions
function calculateScopeEmissions(metrics: MetricData) {
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

// Function to generate a prompt for the AI based on the metrics
const generatePrompt = async (metrics: MetricData) => {
  const scopeEmissions = calculateScopeEmissions(metrics);
  
  const systemContext = `You are a JSON-only response system specialized in farm management recommendations focused on reducing emissions across different scopes. Only output valid JSON objects with no additional text.`;
  
  const prompt = `${systemContext}

Current emissions by scope:
- Scope 1 (Direct): ${scopeEmissions.scope1.toFixed(2)} tons CO2e
- Scope 2 (Energy): ${scopeEmissions.scope2.toFixed(2)} tons CO2e
- Scope 3 (Indirect): ${scopeEmissions.scope3.toFixed(2)} tons CO2e

Additional metrics for context:
Energy: ${metrics.energy.consumption}kWh (${metrics.energy.previousYearComparison}% vs last year)
Waste: ${metrics.waste.quantity} tons
Crops: ${metrics.crops.area} hectares, ${metrics.crops.fertilizer} tons fertilizer
Livestock: ${metrics.livestock.count} animals, ${metrics.livestock.emissions} tons CO2e emissions

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
    const { metrics } = await req.json() as { metrics: MetricData };
    
    if (!metrics) {
      return NextResponse.json(
        { error: "Metrics are required" },
        { status: 400 }
      );
    }

    const prompt = await generatePrompt(metrics);

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
    const recommendations: Recommendation[] = parsedResponse.recommendations.map((rec, index) => ({
      id: `rec_${index}`, // Generate unique ID
      title: rec.title,
      description: rec.description,
      scope: rec.scope || "Scope 1",
      category: CategoryType.OVERALL, // Use enum value
      
      // Impact and Prioritization
      estimatedEmissionReduction: rec.savings || 0,
      priorityLevel: rec.priority 
        ? (rec.priority <= 2 ? 'High' : rec.priority <= 4 ? 'Medium' : 'Low') 
        : 'Medium',
      
      // Implementation Details
      implementationSteps: rec.steps || [],
      estimatedROI: rec.roi || 0,
      
      // Status Tracking
      status: 'Not Started',
      
      // Additional Metadata
      difficulty: rec.difficulty === 'easy' ? 'Easy' 
               : rec.difficulty === 'medium' ? 'Moderate' 
               : rec.difficulty === 'hard' ? 'Challenging' 
               : 'Moderate',
      estimatedCost: 0, // Add logic to estimate cost if needed
      estimatedTimeframe: rec.implementationTimeline || '3-6 months',
      
      // Visualization and Tracking
      relatedMetrics: rec.sourceData ? [rec.sourceData] : [],
      dashboardLink: rec.dashboardLink
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
