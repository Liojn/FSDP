/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/generate-report/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { MetricData } from "@/types";
import Anthropic from "@anthropic-ai/sdk";
import puppeteer from 'puppeteer-core'; // Import puppeteer-core
import { generateHTMLReport } from '@/templates/reportTemplate'; // Import the HTML template
import path from 'path';
import fs from 'fs';

// Initialize the Anthropic AI client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

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

    // Generate HTML content
    const generatedDate = new Date().toLocaleDateString();
    const htmlContent = generateHTMLReport(assistantReply, generatedDate);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      // Specify the path to Chromium executable if necessary
      // executablePath: '/path/to/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF from the page content
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '60px',
        bottom: '60px',
        left: '40px',
        right: '40px',
      },
      // Uncomment below to use Puppeteer's header and footer templates
      /*
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:10px; text-align:center; width:100%;">
          <span>Sustainability Report</span>
        </div>`,
      footerTemplate: `
        <div style="font-size:10px; text-align:center; width:100%;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
      */
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
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
