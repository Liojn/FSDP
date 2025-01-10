/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/recommendation/route.ts

import { NextResponse } from "next/server";
import { Recommendation, MetricData, CategoryType } from "@/types";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

const cleanAndParseJSON = (str: string): ApiResponse => {
  try {
    str = str.trim();
    if (str.startsWith("```json")) str = str.slice(7);
    else if (str.startsWith("```")) str = str.slice(3);
    if (str.endsWith("```")) str = str.slice(0, -3);

    const start = str.indexOf("{");
    const end = str.lastIndexOf("}") + 1;
    if (start === -1 || end === 0) throw new Error("No JSON object found");

    const jsonStr = str.slice(start, end);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("JSON parsing error:", error);
    console.error("Original response content:", str);
    throw error;
  }
};

function calculateScopeEmissions(metrics: MetricData) {
  const scope1 =
    metrics.livestock.emissions + (metrics.emissions.byCategory["equipment"] || 0);
  const scope2 = metrics.energy.consumption * 0.0005;
  const scope3 = metrics.emissions.total - (scope1 + scope2);
  return {
    scope1,
    scope2,
    scope3: Math.max(0, scope3),
  };
}

// Might have to change this
const determineWeatherRisk = (temperature: number, rainfall: number, windSpeed: number) => {
  if (temperature > 30 && rainfall < 50 && windSpeed > 20) {
    return "High risk: Hot, dry conditions with strong winds.";
  } else if (temperature >= 20 && temperature <= 30 && rainfall >= 50 && rainfall <= 100 && windSpeed >= 10 && windSpeed <= 20) {
    return "Medium risk: Moderate conditions.";
  } else {
    return "Low risk: Cool, wet conditions.";
  }
};

const generatePrompt = async (metrics: MetricData, weatherData: any[], scopes?: string[]) => {
  const scopeEmissions = calculateScopeEmissions(metrics);

  const weatherRisk = weatherData.map((data) => ({
    location: data.location,
    temperature: data.temperature,
    rainfall: data.rainfall,
    windSpeed: data.wind_speed,
    risk: determineWeatherRisk(data.temperature, data.rainfall, data.wind_speed),
  }));

  console.log("Metrics Data:", metrics);
  console.log("Weather Data:", weatherData);

  const scopesText =
    scopes && scopes.length > 0
      ? `The user needs recommendations for the following scopes: ${scopes.join(", ")}.`
      : "The user needs general recommendations.";

  const aiPrompt = `
${scopesText}

Current emissions by scope:
- Scope 1 (Direct): ${scopeEmissions.scope1.toFixed(2)} tons CO₂e
- Scope 2 (Energy): ${scopeEmissions.scope2.toFixed(2)} tons CO₂e
- Scope 3 (Indirect): ${scopeEmissions.scope3.toFixed(2)} tons CO₂e

Weather conditions and risks:
${weatherRisk
  .map(
    (risk) =>
      `- ${risk.location}: High temperature (${risk.temperature}°C), rainfall (${risk.rainfall}mm), wind speed (${risk.windSpeed}km/h) — Risk assessment: ${risk.risk}`
  )
  .join("\n")}

**Instructions:**
- Incorporate weather risks into the recommendations, prioritizing solutions for high-risk areas.
- Provide exactly 3 practical recommendations.
- **Return the response as valid JSON only**, with no additional text or explanations.
- **Do not include any markdown, code snippets, or additional formatting.**
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
    // Log the generated prompt
  console.log("Generated AI Prompt:", aiPrompt);

  return aiPrompt;
};

export async function POST(req: Request) {
  try {
    const { metrics, weatherData, scopes } = (await req.json()) as {
      metrics: MetricData;
      weatherData: any[];
      scopes?: string[];
    };

    if (!metrics || !weatherData) {
      return NextResponse.json(
        { error: "Metrics and weather data are required" },
        { status: 400 }
      );
    }

    console.log("Received Metrics:", metrics);
    console.log("Received Weather Data:", weatherData);

    const prompt = await generatePrompt(metrics, weatherData, scopes);

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
    });

    const assistantReply = (msg.content[0] as any).text;
    const parsedResponse: ApiResponse = cleanAndParseJSON(assistantReply);

    const recommendations: Recommendation[] =
      parsedResponse.recommendations.map((rec, index) => ({
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
        dashboardLink: rec.dashboardLink || "",
      }));

    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
