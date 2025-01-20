// src/app/api/recommendation/add/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { Anthropic } from "@anthropic-ai/sdk";
import { ObjectId } from "mongodb";
import connectToDatabase from "dbConfig"; // Adjust the path to match your setup

import {
  CategoryType,
  TrackingRecommendation,
} from "@/types";

import { createRecommendationSchema } from "@/lib/schemas/recommendationSchema";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Zod schema for the request body
// ─────────────────────────────────────────────────────────────────────────────
const requestBodySchema = z.object({
  userId: z.string().nonempty("userId is required"),
  prompt: z.string().nonempty("prompt is required"),
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Anthropic SDK initialization
// ─────────────────────────────────────────────────────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!, // Make sure this is set in your .env
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. AI Recommendation Handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // Parse & validate incoming request
    const body = await req.json();
    const parsed = requestBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 }
      );
    }
    const { userId, prompt } = parsed.data;

    // ─────────────────────────────────────────────────────────────────────────
    // 3a. Generate the AI prompt
    // ─────────────────────────────────────────────────────────────────────────
    const aiResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Given this environmental request: "${prompt}"

          Your goal is to provide specific, impactful, and well-structured recommendations that can be easily implemented by businesses or organizations.
          Based on this request, generate environmentally conscious recommendations following these requirements:
          1. Provide exactly 3 recommendations
          2. Each recommendation must be specific, actionable, and directly related to the environmental request
          3. Use British English spelling and terminology
          4. Format your entire response as JSON only, with no additional text or formatting outside the JSON structure
          5. Ensure that the "category" field for each recommendation is one of the following: ["Overall", "Energy", "Waste", "Crops", "Livestock"]
          6. Ensure that the "difficulty" field for each recommendation is one of the following: ["Easy", "Moderate", "Hard"]
          7. Ensure that the "scope" field for each recommendation is one of the following: ["Scope 1", "Scope 2", "Scope 3"]
          Your response should strictly adhere to the following JSON structure:
          {
            "recommendations": [
              {
                "category": string,
                "title": string,
                "description": string,
                "impact": string,
                "steps": string[],
                "priority": number,
                "savings": number,
                "difficulty": string,
                "implementationTimeline": string,
                "scope": string
              }
            ]
          }
          When generating your recommendations, consider the following guidelines:
        - Ensure each recommendation is directly relevant to the environmental request
        - Provide clear, concise, and informative descriptions for each field
        - Use quantitative data or estimates where possible to support the "impact" and "savings" fields
        - Prioritize recommendations based on their potential impact and feasibility
        - Provide realistic and achievable implementation steps
        - Consider both short-term and long-term environmental benefits
        - Tailor the recommendations to be applicable to a wide range of businesses or organizations within the relevant industry

        - Now, generate your response following the specified JSON structure and requirements. Ensure that your output is valid JSON and includes all required fields for each recommendation.`
            }
          ]
        }
      ],
      system: "You are a specialized environmental consultant tasked with generating actionable, data-driven sustainability recommendations based on a given environmental request."
    });

    // Parse AI response
    interface MessageContent {
      type: 'text';
      text: string;
    }

    const content = aiResponse.content[0] as MessageContent;
    if (!content || content.type !== "text") {
      throw new Error("Unexpected AI response format.");
    }
    const aiText = content.text.trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedAiData: any;
    try {
      parsedAiData = JSON.parse(aiText);
    } catch (err) {
      console.error("Error parsing AI response as JSON:", err);
      return NextResponse.json(
        { error: "Failed to parse AI response. Make sure it's valid JSON." },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsedAiData.recommendations)) {
      return NextResponse.json(
        { error: "AI response did not include 'recommendations' array" },
        { status: 500 }
      );
    }

    const validateCategory = (category: CategoryType) => {
      const validCategories = ["Overall", "Energy", "Waste", "Crops", "Livestock"];
      return validCategories.includes(category);
    };

    const validatedRecs = [];
  for (const rec of parsedAiData.recommendations) {
    // Sanitize and validate category
    if (!validateCategory(rec.category)) {
      console.warn(`Invalid category "${rec.category}" replaced with "Overall".`);
      rec.category = "Overall";
    }

    // Normalize difficulty to match schema expectations
    rec.difficulty = rec.difficulty
      ? rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1).toLowerCase()
      : "Moderate";

    // Map AI fields to match schema requirements
    const mapped = {
      userId,
      title: rec.title || "",
      description: rec.description || "",
      scope: rec.scope || "Scope 1",
      impact: rec.impact || "",
      category: rec.category,
      estimatedEmissionReduction: rec.savings || 0,
      priorityLevel: rec.priority
        ? rec.priority <= 2
          ? "High"
          : rec.priority <= 4
          ? "Medium"
          : "Low"
        : "Medium",
      difficulty: ["Easy", "Moderate", "Hard"].includes(rec.difficulty)
        ? rec.difficulty
        : "Moderate", // Default to "Moderate" if invalid
      estimatedTimeframe: rec.implementationTimeline || "3-6 months",
      implementationSteps: rec.steps && rec.steps.length > 0 ? rec.steps : ["Check feasibility"],
    };

    // Validate using Zod schema
    const validationResult = createRecommendationSchema.safeParse(mapped);
    if (!validationResult.success) {
      console.error("Validation errors for recommendation:", validationResult.error.errors);
      continue; // Skip invalid recommendations
    }

    validatedRecs.push(validationResult.data);
  }


    const trackingRecs: TrackingRecommendation[] = validatedRecs.map((item) => ({
      id: new ObjectId().toString(),
      title: item.title,
      description: item.description,
      scope: item.scope,
      impact: item.impact,
      category: item.category,
      estimatedEmissionReduction: item.estimatedEmissionReduction,
      priorityLevel: item.priorityLevel,
      difficulty: item.difficulty,
      estimatedTimeframe: item.estimatedTimeframe,
      status: "Not Started",
      progress: 0,
      trackingImplementationSteps: item.implementationSteps.map((step, idx) => ({
        id: `${new ObjectId().toString()}-step-${idx}`,
        step,
        complete: false,
      })),
      completedSteps: 0,
      notes: [],
    }));

    const db = await connectToDatabase.connectToDatabase();
    const recommendationsCollection = db.collection("recommendations");

    await recommendationsCollection.updateOne(
      { userId },
      {
        $push: {
          recommendations: {
            $each: trackingRecs,
          },
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json(
      {
        source: "AI",
        recommendations: trackingRecs,
      },
      { status: 201 }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error in /api/recommendation/add POST route:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI recommendations.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
