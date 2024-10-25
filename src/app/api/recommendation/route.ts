import { NextResponse } from "next/server";
import { CategoryType, Recommendation } from "@/types/";
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

export async function POST(req: Request) {
  try {
    const { category } = await req.json();
    
    if (!category || !Object.values(CategoryType).includes(category)) {
      return NextResponse.json({ error: "Valid category is required" }, { status: 400 });
    }

    const prompt = `You are a sustainability recommendation system. Generate exactly 3 practical recommendations for the ${category} category. It is vital that you generate only three. No more than that 
    Return ONLY a JSON object in this exact format with no additional text:
    {
      "recommendations": [
        {
          "title": "Clear action-oriented title",
          "description": "Clear 1-2 sentence description",
          "impact": "Specific metrics and numbers",
          "steps": ["step1", "step2", "step3"],
          "savings": 1000
        }
      ]
    }`;

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a JSON-only response system. Only output valid JSON objects with no additional text or explanation."
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
      category: category as CategoryType,
      implemented: false
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