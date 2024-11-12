/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/recommendations/route.ts

import { NextResponse } from "next/server";
import { Recommendation, MetricData, CategoryType } from "@/types";
import Anthropic from "@anthropic-ai/sdk";

// Initialize the Claude client with the provided API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Define the structure of a recommendation returned from the API
interface ApiRecommendation {
  title: string;
  description: string;
  impact: string;
  steps: string[];
  savings: number;
  priority?: number;
  difficulty?: "easy" | "medium" | "hard";
  roi?: number;
  implementationTimeline?: string;
  sourceData?: string;
  dashboardLink?: string;
  scope?: "Scope 1" | "Scope 2" | "Scope 3";
}

interface ApiResponse {
  recommendations: ApiRecommendation[];
}

// Function to clean and parse JSON from the AI response
const cleanAndParseJSON = (str: string): ApiResponse => {
  try {
    const start = str.indexOf("{");
    const end = str.lastIndexOf("}") + 1;
    if (start === -1 || end === 0) throw new Error("No JSON object found");
    const jsonStr = str.slice(start, end);

    // Parse JSON
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("JSON parsing error:", error);
    console.error("Original response content:", str);
    throw error;
  }
};

// Function to calculate scope-based emissions
function calculateScopeEmissions(metrics: MetricData) {
  const scope1 =
    metrics.livestock.emissions + (metrics.emissions.byCategory["equipment"] || 0);

  const scope2 = metrics.energy.consumption * 0.0005; // Convert kWh to CO2e tons (approximate)

  const scope3 = metrics.emissions.total - (scope1 + scope2);

  return {
    scope1,
    scope2,
    scope3: Math.max(0, scope3),
  };
}

// Function to generate a prompt for the AI based on the metrics
const generatePrompt = async (metrics: MetricData, scopes?: string[]) => {
  const scopeEmissions = calculateScopeEmissions(metrics);

  const scopesText =
    scopes && scopes.length > 0
      ? `The user needs recommendations for the following scopes: ${scopes.join(
          ", "
        )}.`
      : "The user needs general recommendations.";

  const aiPrompt = `
${scopesText}

Current emissions by scope:
- Scope 1 (Direct): ${scopeEmissions.scope1.toFixed(2)} tons CO₂e
- Scope 2 (Energy): ${scopeEmissions.scope2.toFixed(2)} tons CO₂e
- Scope 3 (Indirect): ${scopeEmissions.scope3.toFixed(2)} tons CO₂e

Additional metrics for context:
Energy: ${metrics.energy.consumption} kWh (${metrics.energy.previousYearComparison}% vs last year)
Waste: ${metrics.waste.quantity} tons
Crops: ${metrics.crops.area} hectares, ${metrics.crops.fertilizer} tons fertilizer
Livestock: ${metrics.livestock.count} animals, ${metrics.livestock.emissions} tons CO₂e emissions

**Instructions:**
- Provide exactly 3 practical recommendations.
- **Return the response as valid JSON only**, with no additional text or explanations.
- Use the following structure:

{
  "recommendations": [
    {
      "title": "Actionable recommendation title",
      "description": "Brief description of the recommendation",
      "impact": "Estimated reduction in emissions",
      "steps": ["Step 1", "Step 2"],
      "savings": 0,
      "priority": 1,
      "difficulty": "easy",
      "roi": 10,
      "implementationTimeline": "3 months",
      "sourceData": "source of metrics used",
      "dashboardLink": "/dashboard/link",
      "scope": "Scope 1"
    }
  ]
}

**Ensure that the entire response is valid JSON without any surrounding text or markdown.**
`;

  return aiPrompt;
};

// Handler function for the POST request
export async function POST(req: Request) {
  try {
    console.log("Received recommendation request");
    const { metrics, scopes } = (await req.json()) as {
      metrics: MetricData;
      scopes?: string[];
    };

    if (!metrics) {
      console.error("No metrics provided in request");
      return NextResponse.json(
        { error: "Metrics are required" },
        { status: 400 }
      );
    }

    console.log("Generating prompt with metrics:", JSON.stringify(metrics));
    const prompt = await generatePrompt(metrics, scopes);

    console.log("Sending request to Anthropic API");
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    console.log("Received response from Anthropic API");

    // Check for valid response content and extract the text
    const textContent = message.content.find(
      (block: any) => block.type === "text"
    );
    if (!textContent || !("text" in textContent) || typeof textContent.text !== "string") {
      console.error("No valid text response from Claude");
      throw new Error("No valid text response from Claude");
    }

    console.log("Raw AI response:", textContent.text);

    // Attempt to parse the JSON response
    let parsedResponse: ApiResponse;
    try {
      parsedResponse = cleanAndParseJSON(textContent.text);
      console.log("Successfully parsed recommendations:", JSON.stringify(parsedResponse));
    } catch (parsingError) {
      console.error("Parsing error:", parsingError);
      console.error("Original AI response:", textContent.text);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Transform recommendations
    const recommendations: Recommendation[] = parsedResponse.recommendations.map(
      (rec, index) => ({
        id: `rec_${index}`,
        title: rec.title,
        description: rec.description,
        scope: rec.scope || "Scope 1",
        impact: rec.impact,
        category: CategoryType.OVERALL,
        estimatedEmissionReduction: rec.savings || 0,
        priorityLevel: rec.priority
          ? rec.priority <= 2
            ? "High"
            : rec.priority <= 4
            ? "Medium"
            : "Low"
          : "Medium",
        implementationSteps: rec.steps || [],
        estimatedROI: rec.roi || 0,
        status: "Not Started",
        difficulty:
          rec.difficulty === "easy"
            ? "Easy"
            : rec.difficulty === "medium"
            ? "Moderate"
            : rec.difficulty === "hard"
            ? "Challenging"
            : "Moderate",
        estimatedCost: 0,
        estimatedTimeframe: rec.implementationTimeline || "3-6 months",
        relatedMetrics: rec.sourceData ? [rec.sourceData] : [],
        dashboardLink: rec.dashboardLink,
      })
    );

    console.log("Sending response with recommendations:", JSON.stringify(recommendations));
    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
