import jsPDF from "jspdf";

// Main report generation function using pre-captured images
export const generateSustainabilityReport = async (
  imageDataUrls: string[]
): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    // Add each image from imageDataUrls to the PDF
    for (let i = 0; i < imageDataUrls.length; i++) {
      const imgData = imageDataUrls[i];
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 40; // Adjust for margin
      const imgHeight = (pageWidth * 11) / 8.5; // Adjust for A4 aspect ratio

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    }

    // Save the PDF
    pdf.save("sustainability_report.pdf");
  } catch (error) {
    console.error("Error generating sustainability report:", error);
    // Optionally, show a user-friendly error notification
    alert("Failed to generate PDF report. Please try again.");
  }
};
