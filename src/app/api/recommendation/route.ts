/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { CategoryType, Recommendation, RecommendationRequest } from "@/types/";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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
}

interface ApiResponse {
  recommendations: ApiRecommendation[];
}

// Function to clean and parse JSON response
const cleanAndParseJSON = (str: string): ApiResponse => {
  try {
    // Find the first { and last }
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

// Function to generate category-specific prompt based on metrics
interface Metrics {
  energy: {
    consumption: number;
    previousYearComparison: number;
  };
  emissions: {
    total: number;
  };
  waste: {
    quantity: number;
  };
  crops: {
    area: number;
    fertilizer: number;
  };
  livestock: {
    count: number;
    emissions: number;
  };
}

const generatePrompt = (category: CategoryType, metrics: Metrics, _timeframe: string) => {
  const basePrompt = `You are a farm management AI advisor. Generate exactly 3 practical recommendations for the ${category} category based on the following metrics:

Energy: ${metrics.energy.consumption}kWh (${metrics.energy.previousYearComparison}% vs last year)
Emissions: ${metrics.emissions.total} tons CO2e
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
      "dashboardLink": "/dashboards/category-specific-path"
    }
  ]
}`;

  return basePrompt;
};

export async function POST(req: Request) {
  try {
    const { category, metrics, timeframe } = await req.json() as RecommendationRequest;
    
    if (!category || !metrics || !timeframe) {
      return NextResponse.json(
        { error: "Category, metrics, and timeframe are required" },
        { status: 400 }
      );
    }

    const prompt = generatePrompt(category, metrics, timeframe);

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a JSON-only response system specialized in farm management recommendations. Only output valid JSON objects with no additional text."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error("No response from AI");
    }

    // Parse and validate the response
    const parsedResponse = cleanAndParseJSON(response);

    // Transform API response to match your Recommendation type
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
