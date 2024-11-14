import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Main report generation function
export const generateSustainabilityReport = async (
  elements: (HTMLElement | null)[],
  netZeroGraphRef: React.RefObject<HTMLDivElement> | null,
  emissionsChartRef: React.RefObject<HTMLDivElement> | null
): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    const captureElement = async (
      element: HTMLElement | null,
      pageIndex: number
    ) => {
      if (!element) {
        console.warn(`Skipping page ${pageIndex} - element is null`);
        return;
      }

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
        const imgData = canvas.toDataURL("image/png");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 40; // Adjust for margin
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      } catch (error) {
        console.error(`Error capturing page ${pageIndex}:`, error);
      }
    };

    // Capture and add each section
    for (let i = 0; i < elements.length; i++) {
      await captureElement(elements[i], i);
    }

    // Capture additional charts if refs are provided
    let additionalPageIndex = elements.length;

    if (netZeroGraphRef?.current) {
      console.log("Capturing netZeroGraphRef...");
      await captureElement(netZeroGraphRef.current, additionalPageIndex);
      additionalPageIndex++;
    } else {
      console.warn("netZeroGraphRef is null or not ready.");
    }

    if (emissionsChartRef?.current) {
      console.log("Capturing emissionsChartRef...");
      await captureElement(emissionsChartRef.current, additionalPageIndex);
    } else {
      console.warn("emissionsChartRef is null or not ready.");
    }

    // Save the PDF
    pdf.save("sustainability_report.pdf");
  } catch (error) {
    console.error("Error generating sustainability report:", error);
    // Optionally, show a user-friendly error notification
    alert("Failed to generate PDF report. Please try again.");
  }
};
