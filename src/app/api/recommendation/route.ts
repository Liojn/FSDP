import { NextResponse } from "next/server";
import OpenAI from "openai";

// Type guard to check if API key exists
const getOpenAIInstance = () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  return new OpenAI({
    apiKey: apiKey, // Now TypeScript knows this is definitely a string
  });
};

export async function POST(request: Request) {
  try {
    const openai = getOpenAIInstance();
    const { category } = await request.json();

    const prompt = `Generate 3 detailed sustainability recommendations for the ${category} category. 
    For each recommendation, include:
    - A specific action title
    - Expected savings (a numerical value)
    - A detailed description of implementation
    - The environmental impact
    Format as JSON with properties: title, savings, description, impact.`;

    // Send request to OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a sustainability expert providing actionable recommendations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    // Extract and parse the response
    const content = completion.choices[0]?.message?.content;

    if (content) {
      let recommendations;
      try {
        recommendations = JSON.parse(content);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        return NextResponse.json(
          { error: "Failed to parse recommendations" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        recommendations,
      });
    } else {
      return NextResponse.json(
        { error: "No recommendations returned from OpenAI" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
