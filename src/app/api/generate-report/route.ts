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
  pdf.text("Sustainability Recommendations", 20, 40);

  let yPosition = 80;
  const lines = pdf.splitTextToSize(
    recommendationsText,
    pdf.internal.pageSize.getWidth() - 40
  );

  lines.forEach((line: string) => {
    if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();
      yPosition = 40;
    }
    pdf.text(line, 20, yPosition);
    yPosition += 15;
  });
}

function addHeader(pdf: jsPDF) {
  pdf.setFontSize(24);
  pdf.text("Sustainability Report", 20, 40);
  pdf.setFontSize(14);
  const date = new Date().toLocaleDateString();
  pdf.text(`Generated on: ${date}`, 20, 60);
}

function addFooter(pdf: jsPDF, pageNumber: number, totalPages: number) {
  pdf.setFontSize(12);
  pdf.text(
    `Page ${pageNumber} of ${totalPages}`,
    pdf.internal.pageSize.getWidth() / 2,
    pdf.internal.pageSize.getHeight() - 20,
    { align: "center" }
  );
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

    const totalPages = imageDataUrls.length + 1; // +1 for recommendations page
    let currentPageNumber = 1;

    // Add header on the first page only
    addHeader(pdf);
    addFooter(pdf, currentPageNumber, totalPages);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Adjust image to fill full page width, keeping aspect ratio consistent
    const imgWidth = pageWidth - 40; // margins of 20px on each side
    const imgHeight = imgWidth * 0.5625; // 16:9 aspect ratio

    for (let i = 0; i < imageDataUrls.length; i++) {
      if (i > 0) {
        pdf.addPage();
        currentPageNumber++;
      }

      // Center image vertically on each page
      const imgYPosition = (pageHeight - imgHeight) / 2;

      pdf.addImage(
        imageDataUrls[i],
        "PNG",
        20,
        imgYPosition,
        imgWidth,
        imgHeight,
        undefined,
        "NONE"
      );

      addFooter(pdf, currentPageNumber, totalPages);
    }

    // Add recommendations on a new page
    const aiRecommendations = await getAIRecommendations();
    pdf.addPage();
    currentPageNumber++;
    addFooter(pdf, currentPageNumber, totalPages);
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
