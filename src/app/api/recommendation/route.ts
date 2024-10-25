import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Type guard to check if API key exists
const getGroqInstance = () => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable");
  }

  return new Groq({ apiKey });
};

export async function POST(request: Request) {
  try {
    const groq = getGroqInstance();
    const { category } = await request.json();

    const prompt = `Generate 3 detailed sustainability recommendations for the ${category} category. 
    For each recommendation, include:
    - A specific action title
    - Expected savings (a numerical value)
    - A detailed description of implementation
    - The environmental impact
    Format as JSON with properties: title, savings, description, impact.`;

    // Send request to Groq API
    const completion = await groq.chat.completions.create({
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
      model: "llama3-8b-8192", // Using Groq's LLaMA model
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
        { error: "No recommendations returned from Groq" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}