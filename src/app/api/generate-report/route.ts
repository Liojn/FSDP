/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/generate-report/route.ts

import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function getAIRecommendations() {
  const prompt = `
As an AI assistant, please generate three (3) specific, actionable recommendations that will help a company reduce its environmental impact and improve its sustainability performance. The recommendations should focus on areas where significant improvements can be made and be relevant to common sustainability challenges faced by companies.

Provide the recommendations in plaintext format.
`;

  const response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1000,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  const assistantReply = (response.content[0] as any).text;
  return assistantReply;
}

function addRecommendationsToPDF(pdf: jsPDF, recommendationsText: string) {
  pdf.addPage();
  pdf.setFontSize(20);
  pdf.text("Sustainability Recommendations", 20, 30);

  let yPosition = 60;

  const lines = pdf.splitTextToSize(
    recommendationsText,
    pdf.internal.pageSize.getWidth() - 40
  );

  lines.forEach((line: string) => {
    if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();
      yPosition = 30;
    }
    pdf.text(line, 20, yPosition);
    yPosition += 15;
  });
}

export async function POST(req: Request) {
  try {
    const { imageDataUrls } = await req.json();

    if (!imageDataUrls) {
      return NextResponse.json(
        { error: "Images are required" },
        { status: 400 }
      );
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    pdf.setFontSize(24);
    pdf.text("Sustainability Report", 20, 40);
    pdf.setFontSize(14);
    const date = new Date().toLocaleDateString();
    pdf.text(`Generated on: ${date}`, 20, 60);

    for (let i = 0; i < imageDataUrls.length; i++) {
      if (i > 0) pdf.addPage();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 40;
      const imgHeight = (imgWidth * 9) / 16;
      pdf.addImage(imageDataUrls[i], "PNG", 20, 80, imgWidth, imgHeight);
    }

    const aiRecommendations = await getAIRecommendations();
    addRecommendationsToPDF(pdf, aiRecommendations);

    const pdfDataUri = pdf.output("datauristring");

    return NextResponse.json(
      {
        success: true,
        pdfDataUri,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
