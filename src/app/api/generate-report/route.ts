/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/generate-report/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jsPDF } from 'jspdf';
import { MetricData } from "@/types";
import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic AI client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Function to add a header to the PDF
function addHeader(pdf: jsPDF) {
  pdf.setFontSize(24);
  pdf.text("Sustainability Report", 20, 40);
  pdf.setFontSize(14);
  const date = new Date().toLocaleDateString();
  pdf.text(`Generated on: ${date}`, 20, 60);
}

// Function to add a footer to the PDF
function addFooter(pdf: jsPDF, pageNumber: number, totalPages: number) {
  pdf.setFontSize(12);
  pdf.text(
    `Page ${pageNumber} of ${totalPages}`,
    pdf.internal.pageSize.getWidth() / 2,
    pdf.internal.pageSize.getHeight() - 20,
    { align: "center" }
  );
}

// Function to calculate scope-based emissions with added safety checks for livestock data
function calculateScopeEmissions(metrics: MetricData) {
  const livestockData = metrics.livestock || { count: 0, emissions: 0 };

  const scope1 = 
    (livestockData.emissions || 0) + 
    (metrics.emissions?.byCategory?.equipment || 0);

  const scope2 = (metrics.energy?.consumption || 0) * 0.0005; // Convert kWh to CO2e tons (approximate)

  const totalEmissions = metrics.emissions?.total || 0;
  const scope3 = totalEmissions - (scope1 + scope2);

  return {
    scope1,
    scope2,
    scope3: Math.max(0, scope3),
  };
}

// Generate the prompt content using the provided metrics
const generatePrompt = async (metrics: MetricData) => {
  const scopeEmissions = calculateScopeEmissions(metrics);

  const energyConsumption = metrics.energy?.consumption ?? 0;
  const previousYearComparison = metrics.energy?.previousYearComparison ?? 0;
  const wasteQuantity = metrics.waste?.quantity ?? 0;
  const cropsArea = metrics.crops?.area ?? 0;
  const cropsFertilizer = metrics.crops?.fertilizer ?? 0;
  const livestockCount = metrics.livestock?.count ?? 0;
  const livestockEmissions = metrics.livestock?.emissions ?? 0;

  const aiPrompt = `Generate a comprehensive sustainability report with the following structure and using only the data provided:

OVERVIEW
- Analyze the current total emissions of ${(scopeEmissions.scope1 + scopeEmissions.scope2 + scopeEmissions.scope3).toFixed(2)} tons CO₂e
- Break down emissions by scope:
  * Scope 1: ${scopeEmissions.scope1.toFixed(2)} tons CO₂e
  * Scope 2: ${scopeEmissions.scope2.toFixed(2)} tons CO₂e
  * Scope 3: ${scopeEmissions.scope3.toFixed(2)} tons CO₂e
- Evaluate energy consumption trend of ${energyConsumption} kWh (${previousYearComparison}% change)
- Assess current waste management: ${wasteQuantity} tons
- Review agricultural operations: ${cropsArea} hectares with ${cropsFertilizer} tons fertilizer usage
- Analyze livestock impact: ${livestockCount} animals producing ${livestockEmissions} tons CO₂e

PREDICTIONS
- Project emissions trends for next 12 months based on current data
- Forecast energy consumption patterns considering ${previousYearComparison}% year-over-year change
- Estimate future waste generation trajectory
- Project agricultural impact considering current crop area and fertilizer usage
- Calculate expected livestock emissions based on current herd size

RECOMMENDATIONS
- Provide 3 actionable solutions prioritized by:
  * Emission reduction potential
  * Implementation feasibility
  * Return on investment
- Include specific targets for:
  * Energy efficiency improvements
  * Waste reduction goals
  * Agricultural optimization
  * Livestock management
- Detail implementation timeline and resource requirements

Present the report in a clear, professional format without any introductory phrases or conclusions. Focus on data-driven insights and actionable recommendations.`;

  return aiPrompt;
};

// Main handler for the PDF generation request
export async function POST(request: NextRequest) {
  try {
    const { metrics } = (await request.json()) as { metrics: MetricData };

    if (!metrics) {
      return NextResponse.json({ error: "Metrics data is missing" }, { status: 400 });
    }

    const aiPromptContent = await generatePrompt(metrics);

    const prompt = `\n\nHuman: ${aiPromptContent}\n\nAssistant:`;
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

    const pdf = new jsPDF();
    addHeader(pdf);

    // Add report content with consistent formatting
    addContent(pdf, assistantReply);

    // Add footer for each page
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(pdf, i, totalPages);
    }

    const pdfArrayBuffer = pdf.output('arraybuffer');
    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="sustainability_report.pdf"',
      },
    });

  } catch (error) {
    console.error("Error generating report:", error);
    return new NextResponse(JSON.stringify({ error: "Error generating report" }), { status: 500 });
  }
}

// Function to add content with structured formatting
function addContent(pdf: jsPDF, content: string) {
  pdf.setFont("courier", "normal"); // Use a monospaced font for consistent spacing
  pdf.setFontSize(12);
  
  const sectionTitles = ["OVERVIEW", "PREDICTIONS", "RECOMMENDATIONS"];
  const lines = content.split("\n");

  let yPosition = 80;

  lines.forEach((line) => {
    if (sectionTitles.includes(line.trim().toUpperCase())) {
      pdf.setFontSize(16);
      pdf.setFont("courier", "bold");
      yPosition += 10;
    } else if (line.trim().startsWith("-")) {
      pdf.setFontSize(12);
      pdf.setFont("courier", "normal");
      pdf.text("•", 25, yPosition);
      pdf.text(line.replace("-", "").trim(), 30, yPosition);
      yPosition += 10;
    } else {
      pdf.setFontSize(12);
      pdf.setFont("courier", "normal");
      pdf.text(line.trim(), 20, yPosition);
      yPosition += 7;
    }

    if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();
      yPosition = 40;
      addFooter(pdf, pdf.getNumberOfPages(), pdf.getNumberOfPages());
    }
  });
}

