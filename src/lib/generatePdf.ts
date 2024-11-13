import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generatePdf = async (elements: HTMLElement[]) => {
  const pdf = new jsPDF();
  
  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i]);
    const imgData = canvas.toDataURL("image/png");
    
    // Add the chart/image to the PDF
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth * 0.9;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", (pageWidth - imgWidth) / 2, 20, imgWidth, imgHeight);

    // Add a new page if there are more elements
    if (i < elements.length - 1) pdf.addPage();
  }

  pdf.save("report.pdf");
};
