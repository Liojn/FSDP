/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { CategoryType, Recommendation, RecommendationRequest } from "@/types/";
import { Groq } from "groq-sdk";

// Initialize the Groq client with the provided API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Define the structure of a recommendation returned from the API
interface ApiRecommendation {
  title: string;                       // Title of the recommendation
  description: string;                 // Description of the recommendation
  impact: string;                      // Expected impact of the recommendation
  steps: string[];                     // Steps to implement the recommendation
  savings: number;                     // Estimated savings from the recommendation
  priority?: number;                   // Priority level of the recommendation (optional)
  difficulty?: 'easy' | 'medium' | 'hard'; // Difficulty level of implementation (optional)
  roi?: number;                        // Return on investment (optional)
  implementationTimeline?: string;     // Timeline for implementation (optional)
  sourceData?: string;                 // Reference to metrics used for generating the recommendation (optional)
  dashboardLink?: string;              // Link to the dashboard related to the recommendation (optional)
}

// Define the structure of the API response containing recommendations
interface ApiResponse {
  recommendations: ApiRecommendation[]; // Array of recommendations
}

// Function to clean and parse the JSON response string
const cleanAndParseJSON = (str: string): ApiResponse => {
  try {
    // Find the first '{' and the last '}' in the string to isolate the JSON object
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}') + 1;
    
    // Throw an error if no JSON object is found
    if (start === -1 || end === 0) throw new Error("No JSON object found");
    
    // Extract the JSON string and parse it
    const jsonStr = str.slice(start, end);
    return JSON.parse(jsonStr); // Return the parsed JSON
  } catch (error) {
    console.error("JSON parsing error:", error); // Log any parsing errors
    throw error; // Re-throw the error to be handled upstream
  }
};

// Function to generate a category-specific prompt based on provided metrics
interface Metrics {
  energy: {
    consumption: number;          // Energy consumption in kWh
    previousYearComparison: number; // Comparison percentage with the previous year
  };
  emissions: {
    total: number;                // Total emissions in tons CO2e
  };
  waste: {
    quantity: number;             // Quantity of waste in tons
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

// Function to generate a prompt for the AI based on the category and metrics
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

  return basePrompt; // Return the generated prompt
};

// Handler function for the POST request
export async function POST(req: Request) {
  try {
    // Parse the request body to extract category, metrics, and timeframe
    const { category, metrics, timeframe } = await req.json() as RecommendationRequest;
    
    // Validate the presence of required parameters
    if (!category || !metrics || !timeframe) {
      return NextResponse.json(
        { error: "Category, metrics, and timeframe are required" },
        { status: 400 } // Return a 400 Bad Request response if validation fails
      );
    }

    // Generate the prompt for the AI based on the provided inputs
    const prompt = generatePrompt(category, metrics, timeframe);

    // Call the Groq AI to get recommendations based on the generated prompt
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
      model: "mixtral-8x7b-32768", // Specify the AI model to use
      temperature: 0.7, // Control randomness in response
      max_tokens: 1024, // Limit the length of the response
    });

    // Extract the response content from the AI completion
    const response = completion.choices[0]?.message?.content;
    
    // Check if the response is empty or undefined
    if (!response) {
      throw new Error("No response from AI");
    }

    // Parse and validate the response from the AI
    const parsedResponse = cleanAndParseJSON(response);

    // Transform the API response to match your Recommendation type
    const recommendations: Recommendation[] = parsedResponse.recommendations.map((rec) => ({
      title: rec.title,
      description: rec.description,
      impact: rec.impact,
      steps: rec.steps,
      savings: typeof rec.savings === 'number' ? rec.savings : 0, // Ensure savings is a number
      category,
      implemented: false, // Set implemented status to false by default
      priority: rec.priority,
      difficulty: rec.difficulty,
      roi: rec.roi,
      implementationTimeline: rec.implementationTimeline,
      sourceData: rec.sourceData,
      dashboardLink: rec.dashboardLink
    }));

    // Return the recommendations in the response
    return NextResponse.json({ recommendations }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error); // Log any API errors
    return NextResponse.json(
      { 
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : 'Unknown error' // Include error details if available
      }, 
      { status: 500 } // Return a 500 Internal Server Error response
    );
  }
}
