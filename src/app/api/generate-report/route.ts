/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/generate-report/route.ts

import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import Anthropic from "@anthropic-ai/sdk";
import { MetricData } from "@/types";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Clean and parse JSON helper function
const cleanAndParseJSON = (str: string) => {
  try {
    str = str.trim();
    if (str.startsWith("```json")) str = str.slice(7);
    else if (str.startsWith("```")) str = str.slice(3);
    if (str.endsWith("```")) str = str.slice(0, -3);

    const start = str.indexOf("{");
    const end = str.lastIndexOf("}") + 1;
    if (start === -1 || end === 0) throw new Error("No JSON object found");

    return JSON.parse(str.slice(start, end));
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw error;
  }
};

// Function to calculate scope-based emissions
function calculateScopeEmissions(metrics: MetricData) {
  const scope1 = metrics.livestock.emissions + (metrics.emissions.byCategory["equipment"] || 0);
  const scope2 = metrics.energy.consumption * 0.0005;
  const scope3 = metrics.emissions.total - (scope1 + scope2);

  return {
    scope1,
    scope2,
    scope3: Math.max(0, scope3),
  };
}

// Function to generate recommendations from AI
async function getAIRecommendations(metrics: MetricData) {
  const scopeEmissions = calculateScopeEmissions(metrics);

  const prompt = `
Generate 3 actionable sustainability recommendations based on these metrics:

Emissions Summary:
- Scope 1 (Direct): ${scopeEmissions.scope1.toFixed(2)} tons CO₂e
- Scope 2 (Energy): ${scopeEmissions.scope2.toFixed(2)} tons CO₂e
- Scope 3 (Indirect): ${scopeEmissions.scope3.toFixed(2)} tons CO₂e

Current Metrics:
- Energy: ${metrics.energy.consumption} kWh (${metrics.energy.previousYearComparison}% vs last year)
- Waste: ${metrics.waste.quantity} tons
- Crops: ${metrics.crops.area} hectares, ${metrics.crops.fertilizer} tons fertilizer
- Livestock: ${metrics.livestock.count} animals, ${metrics.livestock.emissions} tons CO₂e

Return the response as valid JSON only with this structure:
{
  "recommendations": [
    {
      "title": "Clear, actionable title",
      "description": "Detailed explanation",
      "impact": "Quantified impact",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "savings": number,
      "priority": 1-5,
      "difficulty": "easy|medium|hard",
      "roi": number,
      "implementationTimeline": "duration",
      "scope": "Scope 1|Scope 2|Scope 3"
    }
  ]
}`;

  const response = await anthropic.messages.create({
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

  const assistantReply = (response.content[0] as any).text;
  return cleanAndParseJSON(assistantReply);
}

// Function to add recommendations to PDF
function addRecommendationsToPDF(pdf: jsPDF, recommendations: any[]) {
  pdf.addPage();
  pdf.setFontSize(20);
  pdf.text("Sustainability Recommendations", 20, 30);

  let yPosition = 60;
  recommendations.forEach((rec, index) => {
    // Add new page if needed
    if (yPosition > pdf.internal.pageSize.getHeight() - 60) {
      pdf.addPage();
      yPosition = 30;
    }

    // Title
    pdf.setFontSize(14);
    pdf.text(`${index + 1}. ${rec.title}`, 20, yPosition);
    yPosition += 20;

    // Description
    pdf.setFontSize(12);
    const descriptionLines = pdf.splitTextToSize(
      rec.description,
      pdf.internal.pageSize.getWidth() - 40
    );
    pdf.text(descriptionLines, 20, yPosition);
    yPosition += descriptionLines.length * 15;

    // Impact and details
    pdf.text(`Impact: ${rec.impact}`, 20, yPosition);
    yPosition += 15;
    pdf.text(`Priority: ${rec.priority}/5`, 20, yPosition);
    yPosition += 15;
    pdf.text(`Difficulty: ${rec.difficulty}`, 20, yPosition);
    yPosition += 15;
    pdf.text(`Implementation Timeline: ${rec.implementationTimeline}`, 20, yPosition);
    yPosition += 15;
    pdf.text(`Estimated ROI: ${rec.roi}%`, 20, yPosition);
    yPosition += 15;
    pdf.text(`Scope: ${rec.scope}`, 20, yPosition);
    yPosition += 25;

    // Implementation steps
    pdf.text("Implementation Steps:", 20, yPosition);
    yPosition += 15;
    rec.steps.forEach((step: string) => {
      pdf.text(`• ${step}`, 30, yPosition);
      yPosition += 15;
    });

    yPosition += 20; // Space between recommendations
  });
}

// Main report generation handler
export async function POST(req: Request) {
  try {
    const { imageDataUrls, metrics } = await req.json();

    if (!imageDataUrls || !metrics) {
      return NextResponse.json(
        { error: "Both images and metrics are required" },
        { status: 400 }
      );
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    // Add title page
    pdf.setFontSize(24);
    pdf.text("Sustainability Report", 20, 40);
    pdf.setFontSize(14);
    const date = new Date().toLocaleDateString();
    pdf.text(`Generated on: ${date}`, 20, 60);

    // Add visualization pages
    for (let i = 0; i < imageDataUrls.length; i++) {
      if (i > 0) pdf.addPage();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 40;
      const imgHeight = (pageWidth * 11) / 8.5;
      pdf.addImage(imageDataUrls[i], "PNG", 20, 20, imgWidth, imgHeight);
    }

    // Get and add AI recommendations
    console.log("Generating AI recommendations...");
    const aiResponse = await getAIRecommendations(metrics);
    addRecommendationsToPDF(pdf, aiResponse.recommendations);

    // Generate and save PDF
    const pdfOutput = pdf.output('datauristring');

    return NextResponse.json({ 
      success: true,
      pdfUrl: pdfOutput
    }, { status: 200 });

  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}